import type { PredictionRequest, PredictionResult, HistoricalData } from '../types/stock'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
    throw new Error((err as { detail?: string }).detail ?? `Failed to fetch historical data (${response.status})`)
  }
  return response.json() as Promise<HistoricalData>
}

// ── Mock helpers for when the API is unavailable ──────────────────────────────

export function generateMockHistoricalData(symbol: string): HistoricalData {
  const prices = []
  let price = 100 + Math.random() * 150
  const now = new Date()

  for (let i = 90; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    // Random walk with slight upward drift
    price = price * (1 + (Math.random() - 0.47) * 0.025)
    prices.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    })
  }

  return { symbol, prices }
}

export function generateMockPrediction(symbol: string, prices: { price: number }[]): PredictionResult {
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
  }
}
