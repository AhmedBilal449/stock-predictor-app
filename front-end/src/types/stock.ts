// ── Request ────────────────────────────────────────────────────────────────────

export interface PredictionRequest {
  symbol: string
  start_date: string
  end_date: string
}

// ── Prediction response ────────────────────────────────────────────────────────

export type Trend = 'bullish' | 'bearish' | 'neutral'

/** Mirrors the FastAPI PredictResponse schema exactly. */
export interface PredictionResult {
  symbol: string
  predicted_price: number
  trend: Trend
  confidence: number
  current_price: number
  change_percent: number
  model_version: string
  generated_at: string   // ISO 8601 UTC datetime string
}

// ── Historical response ────────────────────────────────────────────────────────

/** Mirrors the FastAPI OHLCBar schema. `price` === `close` for chart compatibility. */
export interface HistoricalPrice {
  date: string
  open: number
  high: number
  low: number
  close: number
  price: number   // alias for close — what the chart reads
  volume: number
}

/** Mirrors the FastAPI HistoricalResponse schema. */
export interface HistoricalData {
  symbol: string
  prices: HistoricalPrice[]
  period_days: number
}
