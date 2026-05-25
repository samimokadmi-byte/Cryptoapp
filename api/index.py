import sys
import os

# Ensure `app/` is importable when running as a Vercel serverless function
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app  # FastAPI ASGI app — Vercel detects it automatically
