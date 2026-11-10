import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    print("Starting DOCKSENTRY Security Audit Engine on http://127.0.0.1:8000 ...")
    app.run(host="127.0.0.1", port=8000, debug=False)
