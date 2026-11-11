"""
DOCKSENTRY Unified Desktop Launcher
Auto-starts the backend, frontend, and opens the application window or browser tab.
"""
import os
import sys
import time
import socket
import subprocess
import webbrowser
import urllib.request

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def main():
    print("=" * 60)
    print("   DOCKSENTRY - Autonomous Docker Security Audit Launcher")
    print("=" * 60)

    # 1. Start Backend if not running
    if is_port_in_use(8000):
        print("[✓] Backend API Engine already listening on http://127.0.0.1:8000")
    else:
        print("[*] Starting backend server...")
        venv_py = os.path.join(BACKEND_DIR, ".venv", "bin", "python.exe")
        if not os.path.exists(venv_py):
            venv_py = os.path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
        py_cmd = venv_py if os.path.exists(venv_py) else sys.executable
        run_py = os.path.join(BACKEND_DIR, "run.py")
        subprocess.Popen([py_cmd, run_py], cwd=ROOT_DIR)
        time.sleep(1)

    # 2. Determine target URL
    target_url = "http://localhost:5173"
    if not is_port_in_use(5173):
        dist_index = os.path.join(FRONTEND_DIR, "dist", "index.html")
        if os.path.exists(dist_index):
            target_url = "http://127.0.0.1:8000"
            print(f"[✓] Serving prebuilt frontend from {target_url}")
        else:
            print("[*] Starting Vite development server...")
            npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
            subprocess.Popen([npm_cmd, "run", "dev"], cwd=FRONTEND_DIR)
            time.sleep(1.5)

    # 3. Launch application window
    print(f"[*] Opening DOCKSENTRY application at: {target_url}")

    # Check for dedicated browser app window mode (Brave, Chrome, Edge)
    brave_path = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    launched_standalone = False
    for browser_exe in [brave_path, edge_path]:
        if os.path.exists(browser_exe):
            try:
                subprocess.Popen([browser_exe, f"--app={target_url}"])
                launched_standalone = True
                print(f"[✓] Launched standalone desktop window using {os.path.basename(browser_exe)}")
                break
            except Exception:
                pass

    if not launched_standalone:
        webbrowser.open(target_url)
        print("[✓] Opened in default web browser tab.")

    print("\n[✓] DOCKSENTRY is now live and running!")


if __name__ == "__main__":
    main()
