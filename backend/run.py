import sys
import os
import threading
import webbrowser
import time
import urllib.request

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app


def open_browser():
    time.sleep(1.2)
    target_url = "http://localhost:5173"
    try:
        urllib.request.urlopen("http://localhost:5173", timeout=0.8)
    except Exception:
        target_url = "http://127.0.0.1:8000"

    print(f"[DOCKSENTRY] Auto-launching interface: {target_url}")
    webbrowser.open(target_url)


if __name__ == "__main__":
    print("Starting DOCKSENTRY Security Audit Engine on http://127.0.0.1:8000 ...")
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host="127.0.0.1", port=8000, debug=False)
