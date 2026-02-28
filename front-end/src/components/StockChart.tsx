import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { HistoricalPrice } from '@/types/stock'

interface StockChartProps {
  data: HistoricalPrice[]
  symbol: string
  predictedPrice?: number
}

interface TooltipPayload {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-2 shadow-2xl shadow-black/40">
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-slate-100 font-semibold text-sm">
        ${payload[0].value.toFixed(2)}
      </p>
    </div>
  )
}

export default function StockChart({ data, symbol, predictedPrice }: StockChartProps) {
  if (!data.length) return null

  const firstPrice = data[0].price
  const lastPrice = data[data.length - 1].price
  const isPositive = lastPrice >= firstPrice

  const strokeColor = isPositive ? '#6366f1' : '#f43f5e'
  const gradientId = `gradient-${symbol}`

  const prices = data.map((d) => d.price)
  const minPrice = Math.min(...prices) * 0.985
  const maxPrice = Math.max(...prices, predictedPrice ?? 0) * 1.015

  const tickInterval = Math.max(1, Math.floor(data.length / 6))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="date"
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={tickInterval}
            tickFormatter={(val: string) => {
              const d = new Date(val)
              return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`
            }}
          />

          <YAxis
            stroke="transparent"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: number) => `$${val.toFixed(0)}`}
            width={62}
            domain={[minPrice, maxPrice]}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />

          {predictedPrice && (
            <ReferenceLine
              y={predictedPrice}
              stroke="#818cf8"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{
                value: `Target $${predictedPrice.toFixed(0)}`,
                fill: '#818cf8',
                fontSize: 10,
                position: 'insideTopRight',
                offset: 6,
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: strokeColor, stroke: '#0f172a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
