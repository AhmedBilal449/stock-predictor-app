export interface PredictionRequest {
  symbol: string
  start_date: string
  end_date: string
}

export type Trend = 'bullish' | 'bearish' | 'neutral'

export interface PredictionResult {
  symbol: string
  predicted_price: number
  trend: Trend
  confidence: number
  current_price?: number
  change_percent?: number
}

export interface HistoricalPrice {
  date: string
  price: number
  volume?: number
}

export interface HistoricalData {
  symbol: string
  prices: HistoricalPrice[]
}
