# CryptoTrend — Multi-Timeframe Confluence Engine

Institutional-grade crypto trend prediction dashboard.  
**Assets**: SOL/USDT · ADA/USDT · XRP/USDT · BNB/USDT · SUI/USDT  
**Timeframes**: 15m · 30m · 1h  
**Indicators**: RSI · MACD · EMA 50/200  

---

## Project Structure

```
.
├── backend/           # FastAPI — Python
│   ├── app/
│   │   ├── main.py          # App entry point + CORS
│   │   ├── config.py        # Settings via .env
│   │   ├── models/
│   │   │   └── schemas.py   # Pydantic models
│   │   ├── routes/
│   │   │   ├── analysis.py  # /api/dashboard  /api/asset/{symbol}
│   │   │   └── health.py    # /health
│   │   └── services/
│   │       ├── binance_client.py  # Binance OHLCV fetch
│   │       ├── indicators.py      # RSI, MACD, EMA via pandas-ta
│   │       └── scoring.py         # Trend scoring + confluence
│   ├── requirements.txt
│   └── .env.example
└── frontend/          # Next.js 14 + Tailwind CSS
    └── src/
        ├── app/       # App Router (layout, page, globals.css)
        ├── components/ # Header, AssetCard, AlertPanel, …
        ├── hooks/     # useMarketData (polling hook)
        ├── lib/       # api.ts (typed fetch client)
        └── types/     # TypeScript interfaces
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- A Binance account (free API key — public endpoints work without keys)

---

### 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Edit .env and fill in BINANCE_API_KEY and BINANCE_API_SECRET
# (leave empty strings to use unauthenticated public endpoints)

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API docs available at: http://localhost:8000/docs

---

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# (Optional) configure API URL
# By default points to http://localhost:8000
# echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Start the development server
npm run dev
```

Dashboard available at: http://localhost:3000

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Binance connectivity check |
| GET | `/api/dashboard` | Full analysis for all 5 assets |
| GET | `/api/asset/{symbol}` | Single asset analysis (e.g. `SOLUSDT`) |
| GET | `/docs` | Interactive Swagger UI |

---

## Scoring Algorithm

Each timeframe produces a score **−3 → +3** from 5 signals:

| Signal | Bullish (+1) | Bearish (−1) |
|--------|-------------|--------------|
| RSI | > 55 | < 45 |
| MACD Histogram | > 0 | < 0 |
| MACD vs Signal | MACD > Signal | MACD < Signal |
| Price vs EMA-50 | Above | Below |
| Price vs EMA-200 | Above | Below |

**Trend**: BULLISH ≥ +2 · BEARISH ≤ −2 · NEUTRAL otherwise  
**Confluence**: all 3 timeframes share the same non-NEUTRAL trend
