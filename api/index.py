import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from mangum import Mangum

# Mangum bridges FastAPI (ASGI) with Vercel's Lambda-style invocation
handler = Mangum(app, lifespan="off")
