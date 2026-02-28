import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
  BarChart2,
  DollarSign,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import StockChart from '@/components/StockChart'
import {
  predictStock,
  getHistoricalData,
  generateMockHistoricalData,
  generateMockPrediction,
} from '@/api/stockApi'
import type { PredictionResult, HistoricalData, Trend } from '@/types/stock'

// ── Helpers ───────────────────────────────────────────────────────────────────

const QUICK_SYMBOLS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'AMZN']

function todayISO() {
  return new Date().toISOString().split('T')[0]
}
function yearAgoISO() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().split('T')[0]
}

type TrendConfig = {
  Icon: typeof TrendingUp
  label: string
  variant: 'success' | 'danger' | 'warning'
  textColor: string
  iconBg: string
}

function getTrendConfig(trend: Trend): TrendConfig {
  switch (trend) {
    case 'bullish':
      return {
        Icon: TrendingUp,
        label: 'Bullish',
        variant: 'success',
        textColor: 'text-emerald-500 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10',
      }
    case 'bearish':
      return {
        Icon: TrendingDown,
        label: 'Bearish',
        variant: 'danger',
        textColor: 'text-rose-500 dark:text-rose-400',
        iconBg: 'bg-rose-500/10',
      }
    default:
      return {
        Icon: Minus,
        label: 'Neutral',
        variant: 'warning',
        textColor: 'text-amber-500 dark:text-amber-400',
        iconBg: 'bg-amber-500/10',
      }
  }
}

function formatGeneratedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(iso))
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800/70" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [symbol, setSymbol] = useState('')
  const [startDate, setStartDate] = useState(yearAgoISO)
  const [endDate, setEndDate] = useState(todayISO)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = useCallback(async () => {
    const sym = symbol.trim().toUpperCase()
    if (!sym) return

    setLoading(true)
    setError(null)

    try {
      const [predResult, histResult] = await Promise.allSettled([
        predictStock({ symbol: sym, start_date: startDate, end_date: endDate }),
        getHistoricalData(sym),
      ])

      let hist: HistoricalData
      if (histResult.status === 'fulfilled') {
        hist = histResult.value
      } else {
        hist = generateMockHistoricalData(sym)
      }
      setHistoricalData(hist)

      if (predResult.status === 'fulfilled') {
        setPrediction(predResult.value)
      } else {
        setPrediction(generateMockPrediction(sym, hist.prices))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }, [symbol, startDate, endDate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePredict()
  }

  const trendConfig = prediction ? getTrendConfig(prediction.trend) : null

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Prediction Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Enter a ticker symbol and date range to generate an AI-powered market forecast.
        </p>
      </motion.div>

      {/* ── Input card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="mb-8"
      >
        <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              Prediction Parameters
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Configure your analysis window and click Predict to run the model.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Symbol */}
              <div>
                <Label htmlFor="symbol" className="text-slate-600 dark:text-slate-400 text-xs mb-2 block">
                  Stock Symbol
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-600 pointer-events-none" />
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. AAPL"
                    maxLength={10}
                    className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 focus-visible:ring-indigo-500/60 focus-visible:border-indigo-500/40 font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Start date */}
              <div>
                <Label htmlFor="startDate" className="text-slate-600 dark:text-slate-400 text-xs mb-2 block">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-300 focus-visible:ring-indigo-500/60 dark:[color-scheme:dark]"
                />
              </div>

              {/* End date */}
              <div>
                <Label htmlFor="endDate" className="text-slate-600 dark:text-slate-400 text-xs mb-2 block">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-300 focus-visible:ring-indigo-500/60 dark:[color-scheme:dark]"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handlePredict}
                disabled={!symbol.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200 h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Predict
                  </>
                )}
              </Button>
            </div>

            {/* Quick-pick chips */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                Quick pick
              </span>
              {QUICK_SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-indigo-500/15 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-150 font-mono"
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="mb-6"
          >
            <Card className="bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">Something went wrong</p>
                  <p className="text-rose-500 dark:text-rose-400/70 text-xs mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-rose-400 hover:text-rose-600 dark:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading skeleton ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="animate-pulse h-72 rounded-lg bg-slate-100 dark:bg-slate-800/50" />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {!loading && prediction && trendConfig && (
          <motion.div
            key={`${prediction.symbol}-${prediction.predicted_price}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

              {/* Predicted price */}
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <Badge variant="info" className="text-[10px] px-2">
                      {prediction.symbol}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tabular-nums">
                    ${prediction.predicted_price.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-500">Predicted Price</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Current: <span className="text-slate-700 dark:text-slate-400 font-medium">${prediction.current_price.toFixed(2)}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Generated {formatGeneratedAt(prediction.generated_at)}
                  </p>
                </CardContent>
              </Card>

              {/* Trend */}
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${trendConfig.iconBg} flex items-center justify-center`}>
                      <trendConfig.Icon className={`h-5 w-5 ${trendConfig.textColor}`} />
                    </div>
                    <Badge variant={trendConfig.variant}>{trendConfig.label}</Badge>
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${trendConfig.textColor}`}>
                    {trendConfig.label}
                  </div>
                  <p className="text-xs text-slate-500">Market Signal</p>
                  <p
                    className={`text-xs mt-1 flex items-center gap-0.5 ${
                      prediction.change_percent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {prediction.change_percent >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {prediction.change_percent >= 0 ? '+' : ''}
                    {prediction.change_percent.toFixed(2)}% expected
                  </p>
                </CardContent>
              </Card>

              {/* Confidence */}
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      AI Score
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 tabular-nums">
                    {Math.round(prediction.confidence * 100)}%
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Confidence Level</p>

                  {/* Confidence bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence * 100}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      className={`h-full rounded-full ${
                        prediction.confidence >= 0.75
                          ? 'bg-emerald-500'
                          : prediction.confidence >= 0.55
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">Low</span>
                    <span className="text-[10px] text-slate-400">High</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    model: {prediction.model_version}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ── Chart ── */}
            {historicalData && historicalData.prices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-slate-900 dark:text-slate-100 text-base">
                          {prediction.symbol} — Price History
                        </CardTitle>
                        <CardDescription className="text-slate-500 text-xs mt-1">
                          {historicalData.period_days}-day window · {historicalData.prices.length} trading days · dashed = AI target
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-6 h-px bg-indigo-500 inline-block" />
                          Price
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-6 h-0 border-t-2 border-dashed border-indigo-400/60 inline-block" />
                          Target
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <StockChart
                      data={historicalData.prices}
                      symbol={prediction.symbol}
                      predictedPrice={prediction.predicted_price}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      <AnimatePresence>
        {!loading && !prediction && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-28"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center mx-auto mb-5">
              <BarChart2 className="h-7 w-7 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-2">No prediction yet</h3>
            <p className="text-slate-400 dark:text-slate-600 text-sm max-w-xs mx-auto leading-relaxed">
              Enter a stock symbol above — or pick a quick symbol — and click{' '}
              <span className="text-slate-500 font-medium">Predict</span> to get started.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
