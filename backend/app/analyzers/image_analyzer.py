import os
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from ..models import (
    Finding,
    CodeDiff,
    ResourceType,
    ImageAdvisorItem,
)


# Knowledge base of common container base images, their footprints, CVE risks, and hardened alternatives
IMAGE_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "node": {
        "fat_regex": r"^node(?::(?!.*alpine|.*slim)[\w.-]+)?$",
        "default_tag": "node:20",
        "current_size_mb": 1080,
        "current_cve_estimate": 84,
        "recommended_image": "node:20-alpine",
        "recommended_size_mb": 174,
        "recommended_cve_estimate": 1,
        "risk_level": "HIGH",
    },
    "python": {
        "fat_regex": r"^python(?::(?!.*alpine|.*slim)[\w.-]+)?$",
        "default_tag": "python:3.12",
        "current_size_mb": 1010,
        "current_cve_estimate": 105,
        "recommended_image": "python:3.12-slim",
        "recommended_size_mb": 145,
        "recommended_cve_estimate": 2,
        "risk_level": "HIGH",
    },
    "golang": {
        "fat_regex": r"^golang(?::(?!.*alpine)[\w.-]+)?$",
        "default_tag": "golang:1.22",
        "current_size_mb": 840,
        "current_cve_estimate": 62,
        "recommended_image": "golang:1.22-alpine",
        "recommended_size_mb": 280,
        "recommended_cve_estimate": 1,
        "risk_level": "MEDIUM",
    },
    "ubuntu": {
        "fat_regex": r"^ubuntu(?::.*)?$",
        "default_tag": "ubuntu:latest",
        "current_size_mb": 78,
        "current_cve_estimate": 42,
        "recommended_image": "alpine:3.20",
        "recommended_size_mb": 7,
        "recommended_cve_estimate": 0,
        "risk_level": "HIGH",
    },
    "debian": {
        "fat_regex": r"^debian(?::.*)?$",
        "default_tag": "debian:latest",
        "current_size_mb": 125,
        "current_cve_estimate": 68,
        "recommended_image": "alpine:3.20",
        "recommended_size_mb": 7,
        "recommended_cve_estimate": 0,
        "risk_level": "HIGH",
    },
    "postgres": {
        "fat_regex": r"^postgres(?::(?!.*alpine)[\w.-]+)?$",
        "default_tag": "postgres:latest",
        "current_size_mb": 450,
        "current_cve_estimate": 55,
        "recommended_image": "postgres:16-alpine",
        "recommended_size_mb": 128,
        "recommended_cve_estimate": 2,
        "risk_level": "MEDIUM",
    },
    "redis": {
        "fat_regex": r"^redis(?::(?!.*alpine)[\w.-]+)?$",
        "default_tag": "redis:latest",
        "current_size_mb": 138,
        "current_cve_estimate": 34,
        "recommended_image": "redis:7-alpine",
        "recommended_size_mb": 42,
        "recommended_cve_estimate": 1,
        "risk_level": "MEDIUM",
    },
}


class ImageSecurityAnalyzer:
    """Analyzes container images across Dockerfiles, Compose files, and runtime for CVE bloat and optimization."""

    @staticmethod
    def match_base_image(image_spec: str) -> Optional[Tuple[str, Dict[str, Any]]]:
        """Matches an image name against known base image knowledge base."""
        clean_img = image_spec.strip()
        for base_key, profile in IMAGE_KNOWLEDGE_BASE.items():
            if re.match(profile["fat_regex"], clean_img, re.IGNORECASE):
                return base_key, profile
            # If tag is missing or :latest
            if clean_img == base_key or clean_img == f"{base_key}:latest":
                return base_key, profile
        return None

    @classmethod
    def audit_dockerfile_image(
        cls, filepath: str, lines: List[str]
    ) -> Tuple[List[Finding], List[ImageAdvisorItem]]:
        findings: List[Finding] = []
        advisor_items: List[ImageAdvisorItem] = []
        filename = os.path.basename(filepath)

        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            match = re.match(r"^FROM\s+([^\s]+)", stripped, re.IGNORECASE)
            if match:
                raw_image = match.group(1)
                # Ignore scratch or alias
                if raw_image.lower() in ["scratch", "base", "build"]:
                    continue

                matched = cls.match_base_image(raw_image)
                if matched:
                    base_key, profile = matched
                    size_red = round(
                        ((profile["current_size_mb"] - profile["recommended_size_mb"]) / profile["current_size_mb"]) * 100
                    )
                    cve_red = round(
                        ((profile["current_cve_estimate"] - profile["recommended_cve_estimate"]) / profile["current_cve_estimate"]) * 100
                    )

                    advisor_id = f"adv-df-{idx}"
                    finding_id = f"f-df-image-{idx}"

                    advisor_items.append(
                        ImageAdvisorItem(
                            id=advisor_id,
                            current_image=raw_image,
                            target_resource=f"{filename} (stage {idx})",
                            source_file=filepath,
                            current_size_mb=profile["current_size_mb"],
                            current_cve_estimate=profile["current_cve_estimate"],
                            recommended_image=profile["recommended_image"],
                            recommended_size_mb=profile["recommended_size_mb"],
                            recommended_cve_estimate=profile["recommended_cve_estimate"],
                            size_reduction_pct=size_red,
                            cve_reduction_pct=cve_red,
                            risk_level=profile["risk_level"],
                            remediation_status="PENDING",
                            finding_id=finding_id,
                        )
                    )

                    findings.append(
                        Finding(
                            id=finding_id,
                            rule_id="DS009",
                            title=f"Bloated Base Image '{raw_image}' in {filename}",
                            severity=profile["risk_level"],
                            category="SUPPLY_CHAIN",
                            resource=filename,
                            resource_type=ResourceType.DOCKERFILE.value,
                            source=filepath,
                            line=idx,
                            message=(
                                f"Dockerfile uses bloated base image '{raw_image}' (~{profile['current_size_mb']}MB, "
                                f"~{profile['current_cve_estimate']} estimated package CVEs). "
                                f"Switching to '{profile['recommended_image']}' cuts size by {size_red}% and CVE exposure by {cve_red}%."
                            ),
                            evidence=stripped,
                            why_it_matters=(
                                "Full OS distributions pack compilers, shell utilities, and unneeded libraries. "
                                "Attackers who obtain arbitrary code execution leverage built-in utilities (curl, tar, python, gcc) "
                                "to stage remote rootkits and escape containers."
                            ),
                            remediation=f"Change 'FROM {raw_image}' to 'FROM {profile['recommended_image']}'.",
                            code_diff=CodeDiff(
                                language="dockerfile",
                                insecure=f"FROM {raw_image}",
                                recommended=f"FROM {profile['recommended_image']}",
                                trade_offs=(
                                    f"Minimal image ({profile['recommended_image']}) has minimal preinstalled packages; "
                                    "any missing C libraries (e.g. musl vs glibc) may require alpine-sdk or slim equivalents."
                                ),
                            ),
                            documentation_url="https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#use-multi-stage-builds",
                            status="OPEN",
                            created_at=datetime.utcnow().isoformat() + "Z",
                            auto_fixable=True,
                            remediation_action="optimize_base_image",
                        )
                    )

        return findings, advisor_items

    @classmethod
    def audit_compose_images(
        cls, filepath: str, compose_dict: Dict[str, Any]
    ) -> Tuple[List[Finding], List[ImageAdvisorItem]]:
        findings: List[Finding] = []
        advisor_items: List[ImageAdvisorItem] = []
        filename = os.path.basename(filepath)
        services = compose_dict.get("services") or {}

        for svc_name, svc_conf in services.items():
            if not isinstance(svc_conf, dict):
                continue
            image_val = svc_conf.get("image")
            if not image_val or not isinstance(image_val, str):
                continue

            matched = cls.match_base_image(image_val)
            if matched:
                base_key, profile = matched
                size_red = round(
                    ((profile["current_size_mb"] - profile["recommended_size_mb"]) / profile["current_size_mb"]) * 100
                )
                cve_red = round(
                    ((profile["current_cve_estimate"] - profile["recommended_cve_estimate"]) / profile["current_cve_estimate"]) * 100
                )

                advisor_id = f"adv-cmp-{svc_name}"
                finding_id = f"f-cmp-image-{svc_name}"

                advisor_items.append(
                    ImageAdvisorItem(
                        id=advisor_id,
                        current_image=image_val,
                        target_resource=f"{svc_name} service",
                        source_file=filepath,
                        current_size_mb=profile["current_size_mb"],
                        current_cve_estimate=profile["current_cve_estimate"],
                        recommended_image=profile["recommended_image"],
                        recommended_size_mb=profile["recommended_size_mb"],
                        recommended_cve_estimate=profile["recommended_cve_estimate"],
                        size_reduction_pct=size_red,
                        cve_reduction_pct=cve_red,
                        risk_level=profile["risk_level"],
                        remediation_status="PENDING",
                        finding_id=finding_id,
                    )
                )

                findings.append(
                    Finding(
                        id=finding_id,
                        rule_id="DS009",
                        title=f"Service '{svc_name}' Uses Bloated Image '{image_val}'",
                        severity=profile["risk_level"],
                        category="SUPPLY_CHAIN",
                        resource=f"service:{svc_name}",
                        resource_type=ResourceType.COMPOSE_SERVICE.value,
                        source=filepath,
                        line=None,
                        message=(
                            f"Compose service '{svc_name}' references bloated or unpinned image '{image_val}'. "
                            f"Hardened recommendation: '{profile['recommended_image']}' ({size_red}% smaller)."
                        ),
                        evidence=f"image: {image_val}",
                        why_it_matters=(
                            "Running unhardened image distributions in production exposes services to dozens of known vulnerabilities. "
                            "Using alpine or slim flavors significantly decreases maintenance risk."
                        ),
                        remediation=f"Update service image to '{profile['recommended_image']}'.",
                        code_diff=CodeDiff(
                            language="yaml",
                            insecure=f"  {svc_name}:\n    image: {image_val}",
                            recommended=f"  {svc_name}:\n    image: {profile['recommended_image']}",
                            trade_offs="Ensure any expected pre-bundled utilities match the slim/alpine variant.",
                        ),
                        documentation_url="https://docs.docker.com/compose/compose-file/05-services/#image",
                        status="OPEN",
                        created_at=datetime.utcnow().isoformat() + "Z",
                        auto_fixable=True,
                        remediation_action="optimize_base_image",
                    )
                )

        return findings, advisor_items
