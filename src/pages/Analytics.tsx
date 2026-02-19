import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Package, Star, Clock, Calendar, Filter, Download,
  RefreshCw, ChevronDown, ChevronUp, Maximize2, Minimize2,
  Share2, Printer, Mail, FileText, PieChart, LineChart,
  Activity, Target, Award, Zap, Globe, Map, Smartphone,
  Laptop, Tablet, Moon, Sun, Cloud, CloudRain, CloudSnow,
  Thermometer, Wind, Sunrise, Sunset, Coffee, Gift,
  AlertCircle, CheckCircle, XCircle, HelpCircle,
  Sparkles, Rocket, Crown, Gem, Diamond, Medal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useSwipeable } from 'react-swipeable'
import { useLongPress } from 'use-long-press'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'
import CountUp from 'react-countup'
import {
  LineChart as ReLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { CSVLink } from 'react-csv'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

// ============= TYPES =============
interface DateRange {
  start: Date
  end: Date
  label: string
}

interface MetricCard {
  id: string
  title: string
  value: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ElementType
  color: string
  format: 'currency' | 'number' | 'percentage' | 'time'
  sparklineData: number[]
}

interface SalesData {
  date: string
  revenue: number
  orders: number
  customers: number
  aov: number
}

interface ProductPerformance {
  id: string
  name: string
  image: string
  revenue: number
  orders: number
  units: number
  conversion: number
  views: number
  category: string
}

interface CustomerSegment {
  name: string
  count: number
  revenue: number
  percentage: number
  color: string
}

interface CohortData {
  cohort: string
  size: number
  periods: {
    [key: string]: number
  }
}

interface ForecastData {
  date: string
  actual?: number
  predicted: number
  lower: number
  upper: number
  confidence: number
}

interface GeographicData {
  country: string
  code: string
  revenue: number
  orders: number
  customers: number
  lat: number
  lng: number
}

interface DeviceData {
  device: string
  sessions: number
  revenue: number
  conversion: number
  icon: React.ElementType
}

interface TimeData {
  hour: number
  orders: number
  revenue: number
  customers: number
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  metrics: string[]
  chartType: 'line' | 'bar' | 'pie' | 'table'
  dateRange: string
}

// ============= HOLOGRAPHIC METRIC CARD =============
const HolographicMetricCard: React.FC<{
  card: MetricCard
  onExpand: () => void
  onCompare: () => void
}> = ({ card, onExpand, onCompare }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateY((x - centerX) / 20)
    setRotateX((centerY - y) / 20)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  const formatValue = (value: number) => {
    switch (card.format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'time':
        return `${Math.floor(value / 60)}h ${value % 60}m`
      default:
        return value.toLocaleString()
    }
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY }}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative perspective-1000 h-64 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Front of card */}
      <motion.div
        className={`absolute inset-0 backface-hidden glass-card p-6 ${
          isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onExpand()
                }}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onCompare()
                }}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>
          </div>

          {/* Value */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              key={card.value}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-white"
            >
              <CountUp
                end={card.value}
                duration={2}
                separator=","
                prefix={card.format === 'currency' ? '$' : ''}
                suffix={card.format === 'percentage' ? '%' : ''}
              />
            </motion.div>
            <p className="text-gray-400 text-sm mt-1">{card.title}</p>
          </div>

          {/* Change indicator */}
          <div className="flex items-center justify-between mt-4">
            <div className={`flex items-center space-x-1 ${
              card.trend === 'up' ? 'text-success-green' :
              card.trend === 'down' ? 'text-error-red' :
              'text-gray-400'
            }`}>
              {card.trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {card.trend === 'down' && <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {card.change > 0 ? '+' : ''}{card.change}%
              </span>
            </div>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>

          {/* Sparkline */}
          <div className="h-12 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={card.sparklineData.map((value, i) => ({ i, value }))}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={card.trend === 'up' ? '#10B981' : card.trend === 'down' ? '#EF4444' : '#8B5CF6'}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Back of card */}
      <motion.div
        className={`absolute inset-0 backface-hidden glass-card p-6 ${
          isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        animate={{ rotateY: isFlipped ? 360 : 180 }}
        transition={{ duration: 0.6 }}
        style={{ transform: 'rotateY(180deg)' }}
      >
        <div className="h-full flex flex-col">
          <h3 className="text-white font-medium mb-4">Details</h3>
          
          <div className="space-y-3 flex-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Current</span>
              <span className="text-white font-bold">{formatValue(card.value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Previous</span>
              <span className="text-white">{formatValue(card.previousValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Change</span>
              <span className={card.trend === 'up' ? 'text-success-green' : 'text-error-red'}>
                {card.change}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Goal</span>
              <span className="text-white">{formatValue(card.previousValue * 1.1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">
                {Math.round((card.value / (card.previousValue * 1.1)) * 100)}%
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsFlipped(false)}
            className="mt-4 py-2 bg-cosmic-purple/20 text-cosmic-purple rounded-lg text-sm hover:bg-cosmic-purple/30 transition-colors"
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= INTERACTIVE TIME RANGE SELECTOR =============
const TimeRangeSelector: React.FC<{
  selectedRange: DateRange
  onRangeChange: (range: DateRange) => void
  onCompareChange: (compare: boolean) => void
}> = ({ selectedRange, onRangeChange, onCompareChange }) => {
  const [isComparing, setIsComparing] = useState(false)
  const [customRange, setCustomRange] = useState(false)

  const ranges = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: 1 },
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'This month', days: 'month' },
    { label: 'Last month', days: 'lastMonth' },
    { label: 'This year', days: 'year' },
    { label: 'Custom', days: 'custom' }
  ]

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 bg-dark-card rounded-xl p-1">
        {ranges.slice(0, 4).map((range) => (
          <motion.button
            key={range.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (range.days === 'custom') {
                setCustomRange(true)
              } else {
                const end = new Date()
                const start = range.days === 0 ? startOfDay(new Date()) : subDays(end, range.days as number)
                onRangeChange({
                  start,
                  end: range.days === 0 ? endOfDay(new Date()) : end,
                  label: range.label
                })
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedRange.label === range.label
                ? 'bg-gradient-to-r from-cosmic-purple to-electric-blue text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {range.label}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsComparing(!isComparing)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isComparing
              ? 'bg-cosmic-purple text-white'
              : 'glass-card text-gray-400 hover:text-white'
          }`}
        >
          Compare
        </button>

        <button className="p-2 glass-card hover:bg-dark-hover rounded-lg transition-colors">
          <Calendar className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Custom range modal */}
      <AnimatePresence>
        {customRange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setCustomRange(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative glass-card max-w-md w-full rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">Select Date Range</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setCustomRange(false)}
                  className="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCustomRange(false)
                    toast.success('Date range applied')
                  }}
                  className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============= ANOMALY DETECTION CARD =============
const AnomalyCard: React.FC<{
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  value: string
  timestamp: Date
  onInvestigate: () => void
}> = ({ title, description, severity, value, timestamp, onInvestigate }) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'high': return 'bg-error-red/10 text-error-red border-error-red/20'
      case 'medium': return 'bg-warning-orange/10 text-warning-orange border-warning-orange/20'
      case 'low': return 'bg-electric-blue/10 text-electric-blue border-electric-blue/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border ${getSeverityColor()}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <AlertCircle className={`w-5 h-5 ${
          severity === 'high' ? 'text-error-red' :
          severity === 'medium' ? 'text-warning-orange' :
          'text-electric-blue'
        }`} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistance(timestamp, new Date(), { addSuffix: true })}
          </p>
        </div>
        <button
          onClick={onInvestigate}
          className="px-3 py-1 bg-dark-hover text-white text-sm rounded-lg hover:bg-dark-card transition-colors"
        >
          Investigate
        </button>
      </div>
    </motion.div>
  )
}

// ============= FORECAST CHART =============
const ForecastChart: React.FC<{
  data: ForecastData[]
  onPointClick: (point: ForecastData) => void
}> = ({ data, onPointClick }) => {
  const [showConfidence, setShowConfidence] = useState(true)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Revenue Forecast</h3>
        <button
          onClick={() => setShowConfidence(!showConfidence)}
          className="text-sm text-gray-400 hover:text-white"
        >
          {showConfidence ? 'Hide' : 'Show'} Confidence Interval
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
          />
          <Legend />

          {/* Confidence interval area */}
          {showConfidence && (
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#8B5CF6"
              fillOpacity={0.1}
              name="Upper bound"
            />
          )}

          {/* Actual data */}
          <Bar
            dataKey="actual"
            fill="#10B981"
            name="Actual"
            barSize={20}
            onClick={(data) => onPointClick(data.payload)}
          />

          {/* Predicted data */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Forecast"
          />

          {/* Lower bound */}
          {showConfidence && (
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#8B5CF6"
              fillOpacity={0.1}
              name="Lower bound"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Confidence indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success-green rounded-full" />
          <span className="text-sm text-gray-400">Actual</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cosmic-purple rounded-full" />
          <span className="text-sm text-gray-400">Forecast</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-cosmic-purple/20 rounded-full" />
          <span className="text-sm text-gray-400">80% Confidence</span>
        </div>
      </div>
    </div>
  )
}

// ============= GEOGRAPHIC HEAT MAP =============
const GeographicHeatMap: React.FC<{
  data: GeographicData[]
  onCountryClick: (country: GeographicData) => void
}> = ({ data, onCountryClick }) => {
  // Simple representation - in production you'd use a proper map library
  return (
    <div className="grid grid-cols-4 gap-4">
      {data.map((country) => (
        <motion.div
          key={country.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-card p-3 cursor-pointer"
          onClick={() => onCountryClick(country)}
          style={{
            background: `linear-gradient(135deg, rgba(139, 92, 246, ${country.revenue / 100000}) 0%, rgba(45, 212, 191, ${country.revenue / 100000}) 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{country.code}</span>
            <Globe className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-white mt-2">
            ${(country.revenue / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-400">{country.orders} orders</p>
        </motion.div>
      ))}
    </div>
  )
}

// ============= DEVICE BREAKDOWN =============
const DeviceBreakdown: React.FC<{
  data: DeviceData[]
}> = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((device) => (
        <div key={device.device} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <device.icon className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">{device.device}</span>
            </div>
            <span className="text-white font-medium">
              ${device.revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1 h-2 bg-dark-card rounded-full overflow-hidden">
              <div
                className="h-full bg-cosmic-purple"
                style={{ width: `${(device.revenue / data[0].revenue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{device.conversion}% conv</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============= HOURLY HEATMAP =============
const HourlyHeatmap: React.FC<{
  data: TimeData[]
}> = ({ data }) => {
  return (
    <div className="grid grid-cols-24 gap-1">
      {data.map((hour) => (
        <motion.div
          key={hour.hour}
          whileHover={{ scale: 1.1 }}
          className="relative group"
        >
          <div
            className="h-20 rounded-lg cursor-pointer"
            style={{
              background: `linear-gradient(to top, #8B5CF6, #2DD4BF)`,
              opacity: hour.orders / 50
            }}
          />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block glass-card p-2 whitespace-nowrap">
            <p className="text-xs text-white">{hour.hour}:00</p>
            <p className="text-xs text-gray-400">{hour.orders} orders</p>
            <p className="text-xs text-gray-400">${hour.revenue}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============= COHORT ANALYSIS =============
const CohortAnalysis: React.FC<{
  data: CohortData[]
}> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Cohort</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Size</th>
            {[1, 2, 3, 4, 5, 6].map((month) => (
              <th key={month} className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                Month {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((cohort) => (
            <tr key={cohort.cohort} className="border-b border-dark-border">
              <td className="py-3 px-4 text-white">{cohort.cohort}</td>
              <td className="py-3 px-4 text-white">{cohort.size}</td>
              {[1, 2, 3, 4, 5, 6].map((month) => {
                const retention = cohort.periods[`month${month}`] || 0
                return (
                  <td key={month} className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-dark-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cosmic-purple"
                          style={{ width: `${retention}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{retention}%</span>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============= REPORT BUILDER =============
const ReportBuilder: React.FC<{
  onGenerate: (report: ReportTemplate) => void
  onClose: () => void
}> = ({ onGenerate, onClose }) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])

  const metrics = [
    { id: 'revenue', name: 'Revenue', category: 'Sales' },
    { id: 'orders', name: 'Orders', category: 'Sales' },
    { id: 'aov', name: 'Average Order Value', category: 'Sales' },
    { id: 'customers', name: 'New Customers', category: 'Customers' },
    { id: 'retention', name: 'Retention Rate', category: 'Customers' },
    { id: 'conversion', name: 'Conversion Rate', category: 'Marketing' },
    { id: 'traffic', name: 'Traffic', category: 'Marketing' },
    { id: 'inventory', name: 'Inventory Turnover', category: 'Products' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative glass-card max-w-2xl w-full rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Build Custom Report</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Report Name</label>
            <input
              type="text"
              placeholder="e.g., Monthly Sales Performance"
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              placeholder="What does this report show?"
              rows={3}
              className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Metrics</label>
            <div className="grid grid-cols-2 gap-2">
              {metrics.map((metric) => (
                <label key={metric.id} className="flex items-center space-x-2 p-2 bg-dark-hover rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric.id])
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id))
                      }
                    }}
                    className="rounded border-dark-border bg-dark-card text-cosmic-purple"
                  />
                  <span className="text-sm text-gray-300">{metric.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{metric.category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Chart Type</label>
            <select className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white">
              <option>Line Chart</option>
              <option>Bar Chart</option>
              <option>Pie Chart</option>
              <option>Table</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Date Range</label>
            <select className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This month</option>
              <option>Last month</option>
              <option>This year</option>
              <option>Custom range</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onGenerate({
                id: Date.now().toString(),
                name: 'Custom Report',
                description: 'Generated report',
                metrics: selectedMetrics,
                chartType: 'line',
                dateRange: 'last30days'
              })
              onClose()
              toast.success('Report generated')
            }}
            className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue"
          >
            Generate Report
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= MAIN ANALYTICS PAGE =============
const Analytics: React.FC = () => {
  // State
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 days'
  })
  const [isComparing, setIsComparing] = useState(false)
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [selectedView, setSelectedView] = useState<'overview' | 'sales' | 'customers' | 'products'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  // Data states
  const [metricCards, setMetricCards] = useState<MetricCard[]>([])
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productData, setProductData] = useState<ProductPerformance[]>([])
  const [segmentData, setSegmentData] = useState<CustomerSegment[]>([])
  const [cohortData, setCohortData] = useState<CohortData[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [geoData, setGeoData] = useState<GeographicData[]>([])
  const [deviceData, setDeviceData] = useState<DeviceData[]>([])
  const [timeData, setTimeData] = useState<TimeData[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])

  // Generate mock data
  useEffect(() => {
    // Metric cards
    setMetricCards([
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: 124563,
        previousValue: 100234,
        change: 24.3,
        trend: 'up',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        format: 'currency',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 100000 + 50000)
      },
      {
        id: 'orders',
        title: 'Total Orders',
        value: 1243,
        previousValue: 1123,
        change: 10.7,
        trend: 'up',
        icon: ShoppingBag,
        color: 'from-blue-500 to-cyan-500',
        format: 'number',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 1000 + 500)
      },
      {
        id: 'customers',
        title: 'New Customers',
        value: 345,
        previousValue: 289,
        change: 19.4,
        trend: 'up',
        icon: Users,
        color: 'from-purple-500 to-pink-500',
        format: 'number',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 300 + 100)
      },
      {
        id: 'aov',
        title: 'Avg Order Value',
        value: 89.50,
        previousValue: 85.20,
        change: 5.1,
        trend: 'up',
        icon: DollarSign,
        color: 'from-orange-500 to-red-500',
        format: 'currency',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 20 + 70)
      },
      {
        id: 'conversion',
        title: 'Conversion Rate',
        value: 3.2,
        previousValue: 2.9,
        change: 10.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'from-yellow-500 to-amber-500',
        format: 'percentage',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 2 + 2)
      },
      {
        id: 'ltv',
        title: 'Customer LTV',
        value: 456,
        previousValue: 423,
        change: 7.8,
        trend: 'up',
        icon: Award,
        color: 'from-indigo-500 to-purple-500',
        format: 'currency',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 100 + 350)
      }
    ])

    // Sales data
    setSalesData(Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      revenue: Math.floor(Math.random() * 50000) + 30000,
      orders: Math.floor(Math.random() * 50) + 30,
      customers: Math.floor(Math.random() * 40) + 20,
      aov: Math.floor(Math.random() * 30) + 70
    })))

    // Product performance
    setProductData([
      {
        id: 'p1',
        name: 'Wireless Headphones Pro',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        revenue: 23456,
        orders: 234,
        units: 345,
        conversion: 3.4,
        views: 10234,
        category: 'Electronics'
      },
      {
        id: 'p2',
        name: 'Gaming Mouse X-1000',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
        revenue: 18934,
        orders: 567,
        units: 678,
        conversion: 5.6,
        views: 12345,
        category: 'Electronics'
      },
      {
        id: 'p3',
        name: '4K Ultra HD Monitor',
        image: 'https://images.unsplash.com/photo-1527443225154-cf7b6aa2b7d0?w=100&h=100&fit=crop',
        revenue: 34567,
        orders: 123,
        units: 145,
        conversion: 2.1,
        views: 5678,
        category: 'Electronics'
      }
    ])

    // Customer segments
    setSegmentData([
      { name: 'VIP', count: 234, revenue: 45678, percentage: 35, color: '#8B5CF6' },
      { name: 'Regular', count: 567, revenue: 34567, percentage: 30, color: '#2DD4BF' },
      { name: 'Occasional', count: 890, revenue: 23456, percentage: 20, color: '#F97316' },
      { name: 'New', count: 1234, revenue: 12345, percentage: 15, color: '#10B981' }
    ])

    // Cohort data
    setCohortData([
      { cohort: 'Jan 2024', size: 234, periods: { month1: 100, month2: 65, month3: 58, month4: 52, month5: 48, month6: 45 } },
      { cohort: 'Feb 2024', size: 267, periods: { month1: 100, month2: 68, month3: 62, month4: 55, month5: 51, month6: 47 } },
      { cohort: 'Mar 2024', size: 289, periods: { month1: 100, month2: 71, month3: 64, month4: 58, month5: 53, month6: 49 } }
    ])

    // Forecast data
    setForecastData(Array.from({ length: 14 }, (_, i) => ({
      date: format(subDays(new Date(), 13 - i), 'MMM dd'),
      actual: i < 7 ? Math.floor(Math.random() * 50000) + 30000 : undefined,
      predicted: Math.floor(Math.random() * 50000) + 30000,
      lower: Math.floor(Math.random() * 40000) + 20000,
      upper: Math.floor(Math.random() * 60000) + 40000,
      confidence: 80 + Math.random() * 15
    })))

    // Geographic data
    setGeoData([
      { country: 'United States', code: 'US', revenue: 234567, orders: 2345, customers: 1234, lat: 37.7749, lng: -122.4194 },
      { country: 'United Kingdom', code: 'UK', revenue: 123456, orders: 1234, customers: 678, lat: 51.5074, lng: -0.1278 },
      { country: 'Canada', code: 'CA', revenue: 98765, orders: 987, customers: 543, lat: 43.6532, lng: -79.3832 },
      { country: 'Australia', code: 'AU', revenue: 87654, orders: 876, customers: 432, lat: -33.8688, lng: 151.2093 }
    ])

    // Device data
    setDeviceData([
      { device: 'Mobile', sessions: 12345, revenue: 234567, conversion: 3.2, icon: Smartphone },
      { device: 'Desktop', sessions: 8765, revenue: 198765, conversion: 4.1, icon: Laptop },
      { device: 'Tablet', sessions: 3456, revenue: 65432, conversion: 2.8, icon: Tablet }
    ])

    // Time data
    setTimeData(Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: Math.floor(Math.random() * 30) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      customers: Math.floor(Math.random() * 20) + 5
    })))

    // Anomalies
    setAnomalies([
      {
        title: 'Unusual Revenue Drop',
        description: 'Revenue dropped 45% below average at 2 PM',
        severity: 'high',
        value: '-45%',
        timestamp: subHours(new Date(), 3)
      },
      {
        title: 'Spike in Returns',
        description: 'Returns increased 150% for Electronics category',
        severity: 'medium',
        value: '+150%',
        timestamp: subHours(new Date(), 6)
      },
      {
        title: 'Traffic Anomaly',
        description: 'Mobile traffic 3x higher than usual',
        severity: 'low',
        value: '3x',
        timestamp: subHours(new Date(), 12)
      }
    ])

    setIsLoading(false)
  }, [])

  // Handlers
  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setExportLoading(true)
    try {
      switch (format) {
        case 'pdf':
          const element = document.getElementById('analytics-content')
          if (element) {
            const canvas = await html2canvas(element)
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('l', 'mm', 'a4')
            pdf.addImage(imgData, 'PNG', 10, 10, 280, 0)
            pdf.save('analytics-report.pdf')
          }
          break
        case 'csv':
          const csvData = salesData.map(d => ({
            Date: d.date,
            Revenue: d.revenue,
            Orders: d.orders,
            Customers: d.customers,
            AOV: d.aov
          }))
          const csv = csvData.map(row => Object.values(row).join(',')).join('\n')
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'analytics.csv'
          a.click()
          break
        case 'excel':
          const ws = XLSX.utils.json_to_sheet(salesData)
          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Analytics')
          XLSX.writeFile(wb, 'analytics.xlsx')
          break
      }
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      toast.success('Data refreshed')
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Crunching numbers...</p>
        </div>
      </div>
    )
  }

  return (
    <div id="analytics-content" className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-cosmic-purple" />
            Analytics
            <span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">
              {selectedRange.label}
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Data-driven insights for your business
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center flex-wrap gap-3">
          <TimeRangeSelector
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            onCompareChange={setIsComparing}
          />

          <button
            onClick={() => setShowReportBuilder(true)}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Build Report</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exportLoading}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>

          <button
            onClick={handleRefresh}
            className="p-2 glass-card hover:bg-dark-hover rounded-xl"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* View selector */}
      <div className="flex items-center space-x-2 border-b border-dark-border pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'sales', label: 'Sales', icon: DollarSign },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'products', label: 'Products', icon: Package }
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(view.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === view.id
                ? 'bg-cosmic-purple text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            <view.icon className="w-4 h-4" />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Anomaly alerts */}
      {anomalies.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Anomalies Detected</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalies.map((anomaly, i) => (
              <AnomalyCard
                key={i}
                {...anomaly}
                onInvestigate={() => toast.success('Investigating anomaly')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((card) => (
          <HolographicMetricCard
            key={card.id}
            card={card}
            onExpand={() => toast.success(`Expanding ${card.title}`)}
            onCompare={() => toast.success(`Comparing ${card.title}`)}
          />
        ))}
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                <LineChart className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customer segments */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Customer Segments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="revenue"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast */}
        <div className="glass-card p-6">
          <ForecastChart
            data={forecastData}
            onPointClick={(point) => toast.success(`Forecast: $${point.predicted}`)}
          />
        </div>

        {/* Top products */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Products</h2>
          <div className="space-y-4">
            {productData.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 p-3 bg-dark-hover rounded-lg cursor-pointer"
                onClick={() => toast.success(`Viewing ${product.name}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                    <p className="text-white font-bold">${product.revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{product.orders} orders</span>
                    <span className="text-xs text-gray-400">{product.conversion}% conv</span>
                    <span className="text-xs text-gray-400">{product.views} views</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic data */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h2>
          <GeographicHeatMap
            data={geoData}
            onCountryClick={(country) => toast.success(`Viewing ${country.country}`)}
          />
        </div>

        {/* Device breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Device Breakdown</h2>
          <DeviceBreakdown data={deviceData} />
        </div>

        {/* Hourly heatmap */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Hourly Activity</h2>
          <HourlyHeatmap data={timeData} />
          <p className="text-xs text-gray-400 text-center mt-4">
            Darker = more orders • Hover for details
          </p>
        </div>
      </div>

      {/* Cohort analysis */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Cohort Analysis</h2>
        <CohortAnalysis data={cohortData} />
      </div>

      {/* Report builder modal */}
      <AnimatePresence>
        {showReportBuilder && (
          <ReportBuilder
            onGenerate={(report) => toast.success(`Generated: ${report.name}`)}
            onClose={() => setShowReportBuilder(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Analytics
