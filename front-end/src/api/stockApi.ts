import type { PredictionRequest, PredictionResult, HistoricalData, HistoricalPrice } from '../types/stock'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// ── Real API calls ─────────────────────────────────────────────────────────────

export async function predictStock(request: PredictionRequest): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Prediction failed (${response.status})`)
  }
  return response.json() as Promise<PredictionResult>
}

export async function getHistoricalData(symbol: string): Promise<HistoricalData> {
  const response = await fetch(`${API_BASE}/historical/${symbol.toUpperCase()}`)
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      (err as { detail?: string }).detail ?? `Failed to fetch historical data (${response.status})`,
    )
  }
  return response.json() as Promise<HistoricalData>
}

// ── Mock helpers (fallback when the API is unreachable) ────────────────────────
// These mirror the backend's deterministic output so the UI is always demeable.

export function generateMockHistoricalData(symbol: string): HistoricalData {
  const prices: HistoricalPrice[] = []
  let price = 100 + Math.random() * 150
  const now = new Date()
  const PERIOD_DAYS = 90

  for (let i = PERIOD_DAYS; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue // skip weekends

    price = price * (1 + (Math.random() - 0.47) * 0.025)
    const close = Math.round(price * 100) / 100
    const open = Math.round(close * (1 + (Math.random() - 0.5) * 0.012) * 100) / 100
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.01) * 100) / 100
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.01) * 100) / 100

    prices.push({
      date: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      price: close,
      volume: Math.round(20_000_000 + Math.random() * 40_000_000),
    })
  }

  return { symbol, prices, period_days: PERIOD_DAYS }
}

export function generateMockPrediction(
  symbol: string,
  prices: Pick<HistoricalPrice, 'price'>[],
): PredictionResult {
  const lastPrice = prices[prices.length - 1]?.price ?? 150
  const trends = ['bullish', 'bearish', 'neutral'] as const
  const trend = trends[Math.floor(Math.random() * trends.length)]
  const changeMultiplier = trend === 'bullish' ? 1.05 : trend === 'bearish' ? 0.96 : 1.01
  const predictedPrice = Math.round(lastPrice * changeMultiplier * 100) / 100
  const changePercent = ((predictedPrice - lastPrice) / lastPrice) * 100

  return {
    symbol: symbol.toUpperCase(),
    predicted_price: predictedPrice,
    trend,
    confidence: 0.60 + Math.random() * 0.35,
    current_price: lastPrice,
    change_percent: Math.round(changePercent * 100) / 100,
    model_version: 'mock-v1.0',
    generated_at: new Date().toISOString(),
  }
}
