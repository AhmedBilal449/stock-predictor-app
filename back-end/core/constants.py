"""
Seed prices for well-known tickers.

These make mock data deterministic and realistic-looking across restarts.
Replace with a real market-data source (e.g. yfinance, Alpha Vantage, Polygon)
when integrating live data — no other files need changing.
"""

SEED_PRICES: dict[str, float] = {
    "AAPL":  188.50,
    "TSLA":  215.30,
    "GOOGL": 175.80,
    "MSFT":  415.20,
    "NVDA":  875.40,
    "AMZN":  182.60,
    "META":  510.20,
    "NFLX":  635.80,
    "AMD":   168.90,
    "INTC":   42.30,
    "ORCL":  132.40,
    "CRM":   294.60,
    "ADBE":  576.90,
    "PYPL":   64.20,
    "UBER":   78.50,
    "SHOP":   79.30,
    "COIN":  215.40,
    "PLTR":   23.10,
    "SPY":   520.10,
    "QQQ":   445.80,
}

# Fallback price for symbols not in the table above
DEFAULT_SEED_PRICE: float = 150.0
