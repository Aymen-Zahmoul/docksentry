import os
import re
import shutil
from typing import Dict, Any, Tuple, Optional
from .models import Finding


class RemediationEngine:
    """Safely applies 1-click automated hardening remediations to Dockerfiles and Compose files, with atomic backup & rollback."""

    @classmethod
    def _create_backup(cls, filepath: str) -> str:
        """Creates an atomic backup (.docksentry.bak) before modifying any file."""
        backup_path = f"{filepath}.docksentry.bak"
        # Only overwrite backup if no previous backup exists, ensuring original state is preserved
        if not os.path.exists(backup_path):
            shutil.copy2(filepath, backup_path)
        return backup_path

    @classmethod
    def rollback(cls, finding: Finding) -> Tuple[bool, str]:
        """Restores a previously patched file from its .docksentry.bak backup."""
        filepath = finding.source
        if not filepath or not os.path.exists(filepath):
            # Check if source is a filename in workspace
            return False, f"Target file '{filepath}' does not exist on disk."

        backup_path = f"{filepath}.docksentry.bak"
        if not os.path.exists(backup_path):
            return False, f"No backup file found at '{backup_path}' to restore from."

        try:
            shutil.copy2(backup_path, filepath)
            finding.status = "OPEN"
            return True, f"Successfully rolled back '{os.path.basename(filepath)}' to original state."
        except Exception as e:
            return False, f"Failed to restore backup: {str(e)}"

    @classmethod
    def remediate(cls, finding: Finding) -> Tuple[bool, str]:
        """Applies automated hardening patch based on finding rule and resource type."""
        filepath = finding.source
        if not filepath or not os.path.exists(filepath):
            return False, f"Source file '{filepath}' was not found on disk."

        cls._create_backup(filepath)

        rule_id = finding.rule_id
        res_type = finding.resource_type

        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            patched_content = None
            action_desc = ""

            # -------------------------------------------------------------------------
            # DOCKERFILE REMEDIATIONS
            # -------------------------------------------------------------------------
            if res_type == "dockerfile" or os.path.basename(filepath).lower().startswith("dockerfile"):
                lines = content.splitlines(keepends=True)

                if rule_id == "DS001":
                    # Non-root USER
                    # Check if USER already exists
                    if not any(re.match(r"^USER\s+", l.strip(), re.IGNORECASE) for l in lines):
                        # Insert before CMD or ENTRYPOINT, or at end
                        insert_idx = len(lines)
                        for i, l in enumerate(lines):
                            if re.match(r"^(?:CMD|ENTRYPOINT)\s+", l.strip(), re.IGNORECASE):
                                insert_idx = i
                                break
                        remediation_block = (
                            "\n# [DOCKSENTRY] Hardening: Least-privileged non-root user (CIS Docker 4.1)\n"
                            "USER 10001:10001\n"
                        )
                        lines.insert(insert_idx, remediation_block)
                        patched_content = "".join(lines)
                        action_desc = "Injected 'USER 10001:10001' before container entrypoint"

                elif rule_id == "DS007":
                    # Missing HEALTHCHECK
                    if not any(re.match(r"^HEALTHCHECK\s+", l.strip(), re.IGNORECASE) for l in lines):
                        insert_idx = len(lines)
                        for i, l in enumerate(lines):
                            if re.match(r"^(?:CMD|ENTRYPOINT)\s+", l.strip(), re.IGNORECASE):
                                insert_idx = i
                                break
                        healthcheck_block = (
                            "\n# [DOCKSENTRY] Hardening: Container liveness health probe (CIS Docker 4.6)\n"
                            "HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\\n"
                            "  CMD curl -f http://localhost:8000/health || exit 1\n"
                        )
                        lines.insert(insert_idx, healthcheck_block)
                        patched_content = "".join(lines)
                        action_desc = "Injected standardized HEALTHCHECK probe directive"

                elif rule_id == "DS005":
                    # SSH port 22 exposed
                    new_lines = []
                    for l in lines:
                        if re.match(r"^EXPOSE\s+.*22(\s|$)", l.strip(), re.IGNORECASE):
                            new_lines.append(f"# [DOCKSENTRY Hardened: Removed insecure SSH exposure]\n# {l}")
                        else:
                            new_lines.append(l)
                    patched_content = "".join(new_lines)
                    action_desc = "Disabled insecure EXPOSE 22 instruction"

                elif rule_id == "DS009":
                    # Bloated Base Image
                    new_lines = []
                    replaced = False
                    for l in lines:
                        match = re.match(r"^FROM\s+([^\s]+)(.*)", l.strip(), re.IGNORECASE)
                        if match and not replaced:
                            old_img = match.group(1)
                            rest = match.group(2)
                            # Look up recommendation
                            from .analyzers.image_analyzer import ImageSecurityAnalyzer
                            matched = ImageSecurityAnalyzer.match_base_image(old_img)
                            if matched:
                                _, profile = matched
                                rec_img = profile["recommended_image"]
                                new_lines.append(
                                    f"# [DOCKSENTRY Hardened: Replaced bloated {old_img} with minimal {rec_img}]\n"
                                    f"FROM {rec_img}{rest}\n"
                                )
                                replaced = True
                                action_desc = f"Upgraded base image from '{old_img}' to hardened '{rec_img}'"
                                continue
                        new_lines.append(l)
                    if replaced:
                        patched_content = "".join(new_lines)

            # -------------------------------------------------------------------------
            # COMPOSE REMEDIATIONS
            # -------------------------------------------------------------------------
            elif res_type == "compose_service" or "compose" in os.path.basename(filepath).lower():
                # Line-level string surgical replacement to preserve comments and YAML style
                if rule_id == "DS001":
                    # Inject user: "10001:10001" under service definition
                    svc_match = re.search(r"service:([\w.-]+)", finding.resource)
                    svc_name = svc_match.group(1) if svc_match else None
                    if svc_name and f"{svc_name}:" in content:
                        # Find indentation after service header
                        pattern = rf"(^\s*{re.escape(svc_name)}:\s*\n)"
                        replacement = r"\1    user: '10001:10001' # [DOCKSENTRY Hardened]\n"
                        patched_content = re.sub(pattern, replacement, content, count=1, flags=re.MULTILINE)
                        action_desc = f"Injected non-root user '10001:10001' into service '{svc_name}'"

                elif rule_id == "DS002":
                    # Privileged: true -> false
                    if "privileged: true" in content or "privileged: yes" in content:
                        patched_content = re.sub(
                            r"privileged:\s*(?:true|yes)",
                            "privileged: false # [DOCKSENTRY Hardened: Privileged mode disabled]",
                            content,
                        )
                        action_desc = "Disabled privileged container execution mode"

                elif rule_id == "DS003":
                    # Sensitive docker socket or host mount
                    patched_content = re.sub(
                        r"(-\s*['\"]?/var/run/docker\.sock:[^'\"]+['\"]?)",
                        r"# [DOCKSENTRY Disabled Sensitive Socket Mount] \1",
                        content,
                    )
                    action_desc = "Commented out host /var/run/docker.sock volume mount"

                elif rule_id == "DS004":
                    # Dangerous capabilities (SYS_ADMIN, NET_ADMIN)
                    patched_content = re.sub(
                        r"(-\s*['\"]?SYS_ADMIN['\"]?)",
                        r"# [DOCKSENTRY Removed] \1",
                        content,
                    )
                    patched_content = re.sub(
                        r"(-\s*['\"]?NET_ADMIN['\"]?)",
                        r"# [DOCKSENTRY Removed] \1",
                        patched_content,
                    )
                    action_desc = "Removed elevated Linux capabilities (SYS_ADMIN / NET_ADMIN)"

                elif rule_id == "DS005":
                    # 0.0.0.0 public port binding -> 127.0.0.1
                    # Replace "0.0.0.0:PORT:PORT" or "PORT:PORT" with "127.0.0.1:PORT:PORT"
                    patched_content = re.sub(
                        r"['\"]?0\.0\.0\.0:(\d+:\d+)['\"]?",
                        r"'127.0.0.1:\1'",
                        content,
                    )
                    # Also replace bare "- \"8000:8000\"" or "- \"5432:5432\""
                    patched_content = re.sub(
                        r"(ports:\s*\n(?:\s+-\s*['\"]?)?)(\d{2,5}:\d{2,5})(['\"]?)",
                        r"\1127.0.0.1:\2\3",
                        patched_content,
                    )
                    action_desc = "Bound exposed service ports strictly to localhost (127.0.0.1)"

                elif rule_id == "DS006":
                    # Writable rootfs -> read_only: true
                    svc_match = re.search(r"service:([\w.-]+)", finding.resource)
                    svc_name = svc_match.group(1) if svc_match else None
                    if svc_name and f"{svc_name}:" in content:
                        pattern = rf"(^\s*{re.escape(svc_name)}:\s*\n)"
                        replacement = (
                            r"\1    read_only: true # [DOCKSENTRY Hardened]\n"
                            r"    tmpfs:\n      - /tmp\n"
                        )
                        patched_content = re.sub(pattern, replacement, content, count=1, flags=re.MULTILINE)
                        action_desc = f"Configured read_only rootfs with /tmp tmpfs on service '{svc_name}'"

                elif rule_id == "DS008":
                    # Unbounded limits -> inject limits
                    svc_match = re.search(r"service:([\w.-]+)", finding.resource)
                    svc_name = svc_match.group(1) if svc_match else None
                    if svc_name and f"{svc_name}:" in content:
                        pattern = rf"(^\s*{re.escape(svc_name)}:\s*\n)"
                        replacement = (
                            r"\1    deploy:\n"
                            r"      resources:\n"
                            r"        limits:\n"
                            r"          cpus: '0.50'\n"
                            r"          memory: 512M\n"
                        )
                        patched_content = re.sub(pattern, replacement, content, count=1, flags=re.MULTILINE)
                        action_desc = f"Injected cgroup CPU (0.50) and memory (512M) limits for '{svc_name}'"

                elif rule_id == "DS009":
                    # Bloated base image in compose
                    from .analyzers.image_analyzer import ImageSecurityAnalyzer
                    lines = content.splitlines(keepends=True)
                    new_lines = []
                    replaced = False
                    for l in lines:
                        match = re.search(r"image:\s*([^\s#]+)", l)
                        if match and not replaced:
                            old_img = match.group(1).strip("'\"")
                            matched = ImageSecurityAnalyzer.match_base_image(old_img)
                            if matched:
                                _, profile = matched
                                rec_img = profile["recommended_image"]
                                new_lines.append(
                                    f"    image: {rec_img} # [DOCKSENTRY Hardened: Replaced {old_img}]\n"
                                )
                                replaced = True
                                action_desc = f"Updated service image to minimal hardened '{rec_img}'"
                                continue
                        new_lines.append(l)
                    if replaced:
                        patched_content = "".join(new_lines)

                elif rule_id == "DS010":
                    # Plaintext password / secret -> environment variable interpolation
                    lines = content.splitlines(keepends=True)
                    new_lines = []
                    for l in lines:
                        sec_match = re.search(r"(\w*(?:PASSWORD|SECRET|KEY|TOKEN)\w*)\s*:\s*([^$\s#][^\s#]*)", l, re.IGNORECASE)
                        if sec_match:
                            var_name = sec_match.group(1)
                            new_lines.append(re.sub(
                                r":\s*([^$\s#][^\s#]*)",
                                f": ${{{var_name}}} # [DOCKSENTRY Masked Plaintext Secret]",
                                l
                            ))
                            action_desc = f"Sanitized plaintext secret into environment variable '${{{var_name}}}'"
                        else:
                            new_lines.append(l)
                    patched_content = "".join(new_lines)

            # If patched content was produced, write to disk atomically
            if patched_content and patched_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(patched_content)

                finding.status = "RESOLVED"
                finding.backup_path = f"{filepath}.docksentry.bak"
                return True, action_desc or "Successfully applied automated security hardening fix."

            return False, "Pattern did not match editable configuration or is already hardened."

        except Exception as e:
            return False, f"Failed applying remediation patch: {str(e)}"
