import React, { useState, useEffect } from 'react'
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Package, Clock, Calendar, Download,
  RefreshCw, Maximize2, PieChart, Activity,
  Award, Globe, Smartphone, Laptop, Tablet,
  AlertCircle, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { format, subDays, subHours } from 'date-fns'
import CountUp from 'react-countup'
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line
} from 'recharts'

// ============= TYPES =============
interface MetricCard {
  id: string
  title: string
  value: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ElementType
  color: string
  format: 'currency' | 'number' | 'percentage'
  sparklineData: number[]
}

// ============= HOLOGRAPHIC METRIC CARD =============
const MetricCard: React.FC<{ card: MetricCard; onExpand: () => void }> = ({ card, onExpand }) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}><card.icon className="w-5 h-5 text-white" /></div>
          <button onClick={onExpand} className="p-1 hover:bg-dark-hover rounded"><Maximize2 className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="text-3xl font-bold text-white">
          <CountUp end={card.value} duration={2} separator="," prefix={card.format === 'currency' ? '$' : ''} suffix={card.format === 'percentage' ? '%' : ''} />
        </div>
        <p className="text-gray-400 text-sm mt-1">{card.title}</p>
        <div className="flex items-center justify-between mt-4">
          <div className={`flex items-center space-x-1 ${card.trend === 'up' ? 'text-success-green' : card.trend === 'down' ? 'text-error-red' : 'text-gray-400'}`}>
            {card.trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {card.trend === 'down' && <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{card.change > 0 ? '+' : ''}{card.change}%</span>
          </div>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============= MAIN ANALYTICS PAGE =============
const Analytics: React.FC = () => {
  const [metricCards, setMetricCards] = useState<MetricCard[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [segmentData, setSegmentData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMetricCards([
      { id: 'revenue', title: 'Total Revenue', value: 124563, previousValue: 100234, change: 24.3, trend: 'up', icon: DollarSign, color: 'from-green-500 to-emerald-500', format: 'currency', sparklineData: [] },
      { id: 'orders', title: 'Total Orders', value: 1243, previousValue: 1123, change: 10.7, trend: 'up', icon: ShoppingBag, color: 'from-blue-500 to-cyan-500', format: 'number', sparklineData: [] },
      { id: 'customers', title: 'New Customers', value: 345, previousValue: 289, change: 19.4, trend: 'up', icon: Users, color: 'from-purple-500 to-pink-500', format: 'number', sparklineData: [] },
      { id: 'aov', title: 'Avg Order Value', value: 89.50, previousValue: 85.20, change: 5.1, trend: 'up', icon: DollarSign, color: 'from-orange-500 to-red-500', format: 'currency', sparklineData: [] },
    ])

    setSalesData(Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      revenue: Math.floor(Math.random() * 50000) + 30000
    })))

    setSegmentData([
      { name: 'VIP', value: 45678, color: '#8B5CF6' },
      { name: 'Regular', value: 34567, color: '#2DD4BF' },
      { name: 'Occasional', value: 23456, color: '#F97316' },
      { name: 'New', value: 12345, color: '#10B981' }
    ])

    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400">Crunching numbers...</p></div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center"><BarChart3 className="w-8 h-8 mr-3 text-cosmic-purple" />Analytics</h1></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <MetricCard key={card.id} card={card} onExpand={() => toast.success(`Expanding ${card.title}`)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ background: '#1A1A24', border: '1px solid #333' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fillOpacity={1} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue by Segment</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie data={segmentData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {segmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A1A24', border: '1px solid #333' }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics
