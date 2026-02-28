import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Brain, Shield, Zap, ArrowRight, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    Icon: Brain,
    title: 'AI-Powered Analysis',
    description:
      'Advanced machine learning models trained on decades of market data deliver precise trend signals.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    Icon: TrendingUp,
    title: 'Real-Time Trends',
    description:
      'Get bullish, bearish, or neutral signals updated in real-time, backed by live market feeds.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    Icon: Shield,
    title: 'Confidence Scoring',
    description:
      'Every prediction ships with a calibrated confidence score so you always know how reliable the signal is.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    Icon: Zap,
    title: 'Instant Results',
    description:
      'Optimised FastAPI backend returns predictions in under a second — no waiting, no spinners.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
]

const stats = [
  { value: '94%', label: 'Accuracy' },
  { value: '500+', label: 'Stocks' },
  { value: '<1s', label: 'Latency' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Landing() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-col items-center overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 dark:from-indigo-950/60 dark:via-slate-950 dark:to-violet-950/40 pointer-events-none" />

        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/3 w-[28rem] h-[28rem] bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[24rem] h-[24rem] bg-violet-200/40 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(222.2 84% 4.9%) 1px, transparent 1px), linear-gradient(90deg, hsl(222.2 84% 4.9%) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Pill badge */}
          <motion.div {...fadeUp(0)} className="mb-7">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shadow-lg shadow-indigo-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              Powered by AI &amp; Machine Learning
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
              AI-Powered
            </span>
            <br />
            <span className="text-slate-900 dark:text-slate-100">Stock Trend Predictions</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Harness cutting-edge machine learning to forecast market direction with
            confidence. Get bullish, bearish, and neutral signals backed by 90 days of
            historical analysis — instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...fadeUp(0.3)}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 rounded-xl text-base"
            >
              Start Predicting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl text-base"
              onClick={() => navigate('/dashboard')}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              View Demo
            </Button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            {...fadeUp(0.45)}
            className="mt-16 flex items-center justify-center gap-12"
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {value}
                </div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Why Choose StockSight?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Our platform fuses advanced AI with live market data to deliver signals you
            can actually trade on.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ Icon, title, description, color, bg, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="h-full bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-5`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-sm">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-indigo-200/60 dark:border-indigo-800/30 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/60 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-violet-950/60 p-12 text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-indigo-300/20 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="relative text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Ready to predict the market?
          </h2>
          <p className="relative text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Enter any ticker symbol and get AI-powered insights in under a second.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="relative bg-indigo-600 hover:bg-indigo-500 text-white px-10 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 rounded-xl text-base"
          >
            Start Predicting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </section>
    </main>
  )
}
