import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ShoppingBag, TrendingUp, DollarSign, Package, Users,
  Clock, Star, Truck, AlertCircle, ChevronRight,
  BarChart3, PieChart, Zap, Gift, Tag, CreditCard,
  Filter, Download, RefreshCw, Plus, Search, Eye,
  Edit, Trash2, MoreVertical, ArrowUpRight, ArrowDownRight,
  Calendar, Hash, Award, Target, Globe, Smartphone,
  Laptop, Headphones, Camera, Watch, Gamepad, X,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Heart,
  Share2, Printer, Bookmark, Bell, Settings, HelpCircle,
  Activity, Wind, Thermometer, Sunrise, Sunset,
  Coffee, ShoppingCart, Users2, Wallet, TrendingDown
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ComposedChart, Scatter, Treemap
} from 'recharts'
import { format, subDays, subHours, formatDistance, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useAnimation } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { useLongPress } from 'use-long-press'
import CountUp from 'react-countup'
import Lottie from 'lottie-react'
import { Line as ProgressLine } from 'rc-progress'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

// ============= TYPES =============
interface KPICard {
  id: string
  title: string
  value: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ElementType
  color: string
  gradient: string
  format: 'currency' | 'number' | 'percentage'
  sparklineData: number[]
}

interface Order {
  id: string
  customer: {
    name: string
    avatar: string
    email: string
  }
  amount: number
  items: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  time: Date
  products: {
    name: string
    image: string
    quantity: number
  }[]
}

interface Activity {
  id: string
  type: 'order' | 'customer' | 'review' | 'alert' | 'insight'
  message: string
  timestamp: Date
  user?: {
    name: string
    avatar: string
  }
  actionable: boolean
  action?: {
    label: string
    handler: () => void
  }
}

interface Insight {
  id: string
  title: string
  description: string
  type: 'opportunity' | 'warning' | 'trend' | 'forecast'
  impact: 'high' | 'medium' | 'low'
  action: string
  confidence: number
}

// ============= HOLOGRAPHIC KPI CARD =============
const HolographicKPICard: React.FC<{
  card: KPICard
  onLongPress?: () => void
  onDoubleTap?: () => void
  onSwipe?: (direction: 'left' | 'right') => void
}> = ({ card, onLongPress, onDoubleTap, onSwipe }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  [isFlipped, setIsFlipped] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<NodeJS.Timeout>()
  const tapCount = useRef(0)
  const tapTimer = useRef<NodeJS.Timeout>()

  // 3D tilt effect on hover
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isFlipped) return
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

  // Gesture handlers
  const handleTouchStart = () => {
    setIsPressed(true)
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress()
        navigator.vibrate?.(50)
      }
    }, 500)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    tapCount.current += 1
    if (tapTimer.current) clearTimeout(tapTimer.current)

    tapTimer.current = setTimeout(() => {
      if (tapCount.current === 2) {
        onDoubleTap?.()
        setIsFlipped(!isFlipped)
        navigator.vibrate?.(30)
      }
      tapCount.current = 0
    }, 300)
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe?.('left'),
    onSwipedRight: () => onSwipe?.('right'),
    trackMouse: true
  })

  // Format value based on type
  const formattedValue = useMemo(() => {
    switch (card.format) {
      case 'currency':
        return `$${card.value.toLocaleString()}`
      case 'percentage':
        return `${card.value}%`
      default:
        return card.value.toLocaleString()
    }
  }, [card])

  return (
    <motion.div
      ref={cardRef}
      {...handlers}
      style={{ rotateX, rotateY }}
      animate={{
        scale: isPressed ? 0.98 : 1,
        rotateX,
        rotateY
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative perspective-1000 h-64 cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Front of card */}
      <motion.div
        className={`absolute inset-0 backface-hidden glass-card p-6 ${
          isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0`}
          animate={{ opacity: isPressed ? 0.2 : 0.1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating particles */}
        <AnimatePresence>
          {isPressed && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${card.gradient}`}
                  initial={{ x: '50%', y: '50%', opacity: 0 }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <motion.div
              animate={{ rotate: isPressed ? 90 : 0 }}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                card.trend === 'up' ? 'bg-success-green/10 text-success-green' :
                card.trend === 'down' ? 'bg-error-red/10 text-error-red' :
                'bg-gray-500/10 text-gray-400'
              }`}
            >
              {card.trend === 'up' ? '↑' : card.trend === 'down' ? '↓' : '→'} {Math.abs(card.change)}%
            </motion.div>
          </div>

          {/* Value */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              key={formattedValue}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-white"
            >
              <CountUp end={card.value} duration={2} separator="," prefix={card.format === 'currency' ? '$' : ''} suffix={card.format === 'percentage' ? '%' : ''} />
            </motion.div>
            <p className="text-gray-400 text-sm mt-1">{card.title}</p>
          </div>

          {/* Sparkline */}
          <div className="h-12 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={card.sparklineData.map((value, index) => ({ index, value }))}>
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

          {/* Quick action hint */}
          <motion.div
            animate={{ opacity: isPressed ? 1 : 0 }}
            className="absolute bottom-2 right-2 text-xs text-gray-500"
          >
            Double-tap for details
          </motion.div>
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
          <h3 className="text-white font-medium mb-4">{card.title} Details</h3>
          
          <div className="space-y-3 flex-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Current</span>
              <span className="text-white font-bold">{formattedValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Previous</span>
              <span className="text-white">
                {card.format === 'currency' ? `$${card.previousValue.toLocaleString()}` : card.previousValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Change</span>
              <span className={card.trend === 'up' ? 'text-success-green' : 'text-error-red'}>
                {card.change}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">vs Target</span>
              <span className="text-success-green">+12%</span>
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

// ============= INTERACTIVE CHART =============
const InteractiveChart: React.FC<{
  data: any[]
  onPointClick?: (point: any) => void
  onRangeSelect?: (start: number, end: number) => void
}> = ({ data, onPointClick, onRangeSelect }) => {
  const [selectedPoints, setSelectedPoints] = useState<number[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!chartRef.current) return
    setIsSelecting(true)
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const index = Math.floor((x / rect.width) * data.length)
    setSelectionStart(index)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || selectionStart === null || !chartRef.current) return
    const rect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const currentIndex = Math.floor((x / rect.width) * data.length)
    
    const start = Math.min(selectionStart, currentIndex)
    const end = Math.max(selectionStart, currentIndex)
    setSelectedPoints(Array.from({ length: end - start + 1 }, (_, i) => start + i))
  }

  const handleMouseUp = () => {
    if (isSelecting && selectionStart !== null && selectedPoints.length > 0) {
      onRangeSelect?.(selectedPoints[0], selectedPoints[selectedPoints.length - 1])
    }
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectedPoints([])
  }

  return (
    <div
      ref={chartRef}
      className="relative h-64 cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#666" />
          <YAxis stroke="#666" />
          <Tooltip
            contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
            cursor={{ stroke: '#8B5CF6', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#8B5CF6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            activeDot={{ r: 8, onClick: (props) => onPointClick?.(props.payload) }}
          />
          
          {/* Selection overlay */}
          {selectedPoints.length > 0 && (
            <Area
              data={data.map((d, i) => ({
                ...d,
                selected: selectedPoints.includes(i) ? d.revenue : 0
              }))}
              dataKey="selected"
              stroke="none"
              fill="#8B5CF6"
              fillOpacity={0.3}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Selection hint */}
      {isSelecting && (
        <div className="absolute top-2 right-2 glass-card px-3 py-1 rounded-lg text-xs text-white">
          Drag to select range
        </div>
      )}
    </div>
  )
}

// ============= ACTIVITY FEED WITH GESTURES =============
const GestureActivityFeed: React.FC<{
  activities: Activity[]
  onDismiss: (id: string) => void
  onSnooze: (id: string) => void
}> = ({ activities, onDismiss, onSnooze }) => {
  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <SwipeableActivity
          key={activity.id}
          activity={activity}
          onDismiss={onDismiss}
          onSnooze={onSnooze}
        />
      ))}
    </div>
  )
}

const SwipeableActivity: React.FC<{
  activity: Activity
  onDismiss: (id: string) => void
  onSnooze: (id: string) => void
}> = ({ activity, onDismiss, onSnooze }) => {
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    setOffset(Math.max(-100, Math.min(100, diff)))
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (Math.abs(offset) > 50) {
      if (offset > 0) {
        onSnooze(activity.id)
        toast.success('Activity snoozed')
      } else {
        onDismiss(activity.id)
        toast.success('Activity dismissed')
      }
    }
    setOffset(0)
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch(type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-success-green" />
      case 'customer': return <Users className="w-4 h-4 text-electric-blue" />
      case 'review': return <Star className="w-4 h-4 text-gold" />
      case 'alert': return <AlertCircle className="w-4 h-4 text-error-red" />
      case 'insight': return <Zap className="w-4 h-4 text-cosmic-purple" />
      default: return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <motion.div
      animate={{ x: offset }}
      transition={{ type: 'spring', damping: 30 }}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-success-green/20 flex items-center justify-start pl-4">
          <Bell className="w-5 h-5 text-success-green" />
          <span className="ml-2 text-success-green text-sm">Snooze</span>
        </div>
        <div className="flex-1 bg-error-red/20 flex items-center justify-end pr-4">
          <X className="w-5 h-5 text-error-red" />
          <span className="mr-2 text-error-red text-sm">Dismiss</span>
        </div>
      </div>

      {/* Foreground content */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-dark-hover p-4 rounded-xl cursor-pointer"
      >
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${
            activity.type === 'alert' ? 'bg-error-red/20' :
            activity.type === 'insight' ? 'bg-cosmic-purple/20' :
            'bg-dark-card'
          }`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">{activity.message}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatDistance(activity.timestamp, new Date(), { addSuffix: true })}
              </span>
              {activity.actionable && activity.action && (
                <button
                  onClick={activity.action.handler}
                  className="text-xs text-cosmic-purple hover:text-electric-blue"
                >
                  {activity.action.label} →
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= AI INSIGHTS PANEL =============
const AIInsightsPanel: React.FC<{
  insights: Insight[]
  onAction: (insight: Insight) => void
}> = ({ insights, onAction }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <motion.div
          key={insight.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-4 cursor-pointer border-l-4 ${
            insight.type === 'opportunity' ? 'border-success-green' :
            insight.type === 'warning' ? 'border-warning-orange' :
            insight.type === 'trend' ? 'border-electric-blue' :
            'border-cosmic-purple'
          }`}
          onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  insight.impact === 'high' ? 'bg-error-red/20 text-error-red' :
                  insight.impact === 'medium' ? 'bg-warning-orange/20 text-warning-orange' :
                  'bg-success-green/20 text-success-green'
                }`}>
                  {insight.impact} impact
                </span>
                <span className="text-xs text-gray-400">{insight.confidence}% confidence</span>
              </div>
              <h3 className="text-white font-medium mb-1">{insight.title}</h3>
              <p className="text-sm text-gray-400">{insight.description}</p>
              
              <AnimatePresence>
                {expandedId === insight.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <p className="text-sm text-gray-300 mb-3">{insight.action}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onAction(insight)
                      }}
                      className="px-4 py-2 bg-cosmic-purple text-white rounded-lg text-sm hover:bg-electric-blue transition-colors"
                    >
                      Take Action
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
              expandedId === insight.id ? 'rotate-180' : ''
            }`} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============= RECENT ORDERS TABLE =============
const RecentOrdersTable: React.FC<{
  orders: Order[]
  onOrderClick: (order: Order) => void
  onStatusChange: (orderId: string, status: Order['status']) => void
}> = ({ orders, onOrderClick, onStatusChange }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Order</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Products</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Time</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <motion.tr
              key={order.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className="border-b border-dark-border cursor-pointer"
              onClick={() => onOrderClick(order)}
            >
              <td className="py-3 px-4">
                <span className="text-white font-medium">{order.id}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={order.customer.avatar}
                    alt={order.customer.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white text-sm">{order.customer.name}</p>
                    <p className="text-xs text-gray-400">{order.customer.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex -space-x-2">
                  {order.products.slice(0, 3).map((product, i) => (
                    <img
                      key={i}
                      src={product.image}
                      alt={product.name}
                      className="w-6 h-6 rounded-full border-2 border-dark-card object-cover"
                      title={`${product.name} (${product.quantity})`}
                    />
                  ))}
                  {order.products.length > 3 && (
                    <span className="w-6 h-6 rounded-full bg-dark-hover border-2 border-dark-card flex items-center justify-center text-xs text-gray-400">
                      +{order.products.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-white font-bold">${order.amount.toFixed(2)}</span>
              </td>
              <td className="py-3 px-4">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
                  className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${
                    order.status === 'delivered' ? 'bg-success-green/10 text-success-green' :
                    order.status === 'processing' ? 'bg-warning-orange/10 text-warning-orange' :
                    order.status === 'shipped' ? 'bg-electric-blue/10 text-electric-blue' :
                    order.status === 'pending' ? 'bg-gray-500/10 text-gray-400' :
                    'bg-error-red/10 text-error-red'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-400">
                  {formatDistance(order.time, new Date(), { addSuffix: true })}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success(`Viewing order ${order.id}`)
                    }}
                    className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success(`Editing order ${order.id}`)
                    }}
                    className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============= MAIN DASHBOARD COMPONENT =============
const Dashboard: React.FC = () => {
  // ============= STATE =============
  const [kpiCards, setKpiCards] = useState<KPICard[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('week')
  const [showConfetti, setShowConfetti] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null)
  
  const { width, height } = useWindowSize()
  const pullToRefreshThreshold = 100
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)

  // ============= GENERATE MOCK DATA =============
  useEffect(() => {
    // Generate KPI cards
    setKpiCards([
      {
        id: 'kpi-1',
        title: 'Total Revenue',
        value: 124563,
        previousValue: 100234,
        change: 24.3,
        trend: 'up',
        icon: DollarSign,
        color: 'from-green-500 to-emerald-500',
        gradient: 'from-green-500 to-emerald-500',
        format: 'currency',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 100000 + 50000)
      },
      {
        id: 'kpi-2',
        title: 'Total Orders',
        value: 1243,
        previousValue: 1123,
        change: 10.7,
        trend: 'up',
        icon: ShoppingBag,
        color: 'from-blue-500 to-cyan-500',
        gradient: 'from-blue-500 to-cyan-500',
        format: 'number',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 1000 + 500)
      },
      {
        id: 'kpi-3',
        title: 'Conversion Rate',
        value: 3.2,
        previousValue: 2.9,
        change: 10.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500',
        gradient: 'from-purple-500 to-pink-500',
        format: 'percentage',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 2 + 2)
      },
      {
        id: 'kpi-4',
        title: 'Avg Order Value',
        value: 89.50,
        previousValue: 85.20,
        change: 5.1,
        trend: 'up',
        icon: Wallet,
        color: 'from-orange-500 to-red-500',
        gradient: 'from-orange-500 to-red-500',
        format: 'currency',
        sparklineData: Array.from({ length: 30 }, () => Math.random() * 20 + 70)
      }
    ])

    // Generate orders
    setOrders(Array.from({ length: 20 }, (_, i) => ({
      id: `ORD-${String(i + 1).padStart(3, '0')}`,
      customer: {
        name: ['John Smith', 'Emma Watson', 'Michael Chen', 'Sarah Johnson', 'David Brown'][Math.floor(Math.random() * 5)],
        avatar: `https://images.unsplash.com/photo-${[
          '1500648767791-00dcc994a43e',
          '1494790108777-7669c5f07f99',
          '1507003211169-0a1dd7228f2d',
          '1438761681033-6461ffad8d80',
          '1500648767791-00dcc994a43e'
        ][Math.floor(Math.random() * 5)]}?w=50&h=50&fit=crop`,
        email: 'customer@example.com'
      },
      amount: Math.random() * 500 + 50,
      items: Math.floor(Math.random() * 5) + 1,
      status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)] as Order['status'],
      time: subHours(new Date(), Math.floor(Math.random() * 48)),
      products: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
        name: ['Wireless Headphones', 'Gaming Mouse', '4K Monitor', 'Mechanical Keyboard'][Math.floor(Math.random() * 4)],
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=50&h=50&fit=crop',
        quantity: Math.floor(Math.random() * 3) + 1
      }))
    })))

    // Generate activities
    setActivities(Array.from({ length: 10 }, (_, i) => ({
      id: `act-${i}`,
      type: ['order', 'customer', 'review', 'alert', 'insight'][Math.floor(Math.random() * 5)] as Activity['type'],
      message: [
        'New order received from John Smith',
        'Sarah Johnson just signed up',
        'New 5-star review on Wireless Headphones',
        'Low stock alert: Gaming Mouse (3 left)',
        'AI Insight: Sales up 23% this week'
      ][Math.floor(Math.random() * 5)],
      timestamp: subHours(new Date(), Math.floor(Math.random() * 24)),
      actionable: Math.random() > 0.5,
      action: {
        label: 'View',
        handler: () => toast.success('Action clicked')
      }
    })))

    // Generate insights
    setInsights([
      {
        id: 'insight-1',
        title: 'Opportunity: Cross-sell Headphones',
        description: 'Customers who bought Gaming Mice are 3x more likely to buy headphones',
        type: 'opportunity',
        impact: 'high',
        action: 'Create bundle: Gaming Mouse + Headphones for 15% off',
        confidence: 87
      },
      {
        id: 'insight-2',
        title: 'Warning: Electronics stock low',
        description: '5 popular electronics items running low',
        type: 'warning',
        impact: 'medium',
        action: 'View low stock items and create purchase orders',
        confidence: 95
      },
      {
        id: 'insight-3',
        title: 'Trend: Mobile shopping up',
        description: 'Mobile orders increased 34% this month',
        type: 'trend',
        impact: 'medium',
        action: 'Optimize mobile checkout experience',
        confidence: 92
      },
      {
        id: 'insight-4',
        title: 'Forecast: Weekend sale',
        description: 'Projected 45% increase in sales this weekend',
        type: 'forecast',
        impact: 'high',
        action: 'Prepare inventory and marketing campaign',
        confidence: 78
      }
    ])

    // Generate sales data
    setSalesData(Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      revenue: Math.floor(Math.random() * 50000) + 30000,
      orders: Math.floor(Math.random() * 50) + 30
    })))

    // Generate category data
    setCategoryData([
      { name: 'Electronics', value: 35, color: '#8B5CF6' },
      { name: 'Fashion', value: 25, color: '#2DD4BF' },
      { name: 'Home', value: 20, color: '#F97316' },
      { name: 'Sports', value: 12, color: '#10B981' },
      { name: 'Beauty', value: 8, color: '#EC4899' }
    ])
  }, [])

  // ============= PULL TO REFRESH =============
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPulling && window.scrollY === 0) {
      const diff = e.touches[0].clientY - startY.current
      if (diff > 0) {
        setPullDistance(Math.min(diff, pullToRefreshThreshold))
      }
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance >= pullToRefreshThreshold) {
      handleRefresh()
    }
    setPullDistance(0)
    setIsPulling(false)
  }

  // ============= REFRESH =============
  const handleRefresh = () => {
    setIsRefreshing(true)
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Refreshing dashboard...',
        success: 'Dashboard updated!',
        error: 'Refresh failed'
      }
    ).then(() => {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      setIsRefreshing(false)
    })
  }

  // ============= HANDLERS =============
  const handleKPILongPress = (card: KPICard) => {
    toast.success(`Quick export of ${card.title} data`, { icon: '📊' })
  }

  const handleKPIDoubleTap = (card: KPICard) => {
    toast.success(`Viewing detailed ${card.title} report`, { icon: '📈' })
  }

  const handleKPISwipe = (card: KPICard, direction: 'left' | 'right') => {
    if (direction === 'left') {
      toast.success(`Previous ${card.title} period`, { icon: '⬅️' })
    } else {
      toast.success(`Next ${card.title} period`, { icon: '➡️' })
    }
  }

  const handleOrderClick = (order: Order) => {
    toast.success(`Viewing order ${order.id}`)
  }

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    toast.success(`Order ${orderId} status updated to ${status}`)
  }

  const handleInsightAction = (insight: Insight) => {
    toast.success(`Taking action: ${insight.action}`, { icon: '🚀' })
  }

  const handleDismissActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const handleSnoozeActivity = (id: string) => {
    toast.success('Activity snoozed for 1 hour')
  }

  const handleRangeSelect = (start: number, end: number) => {
    setSelectedRange({ start, end })
    toast.success(`Selected ${end - start + 1} days of data`)
  }

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    toast.success(`Exporting as ${format.toUpperCase()}...`, { icon: '📥' })
  }

  return (
    <div
      className="p-4 lg:p-6 space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Confetti for celebrations */}
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      {/* Pull to refresh indicator */}
      <motion.div
        className="flex justify-center"
        animate={{ height: pullDistance }}
      >
        {pullDistance > 0 && (
          <motion.div
            animate={{ rotate: pullDistance >= pullToRefreshThreshold ? 180 : 0 }}
            className="w-8 h-8 rounded-full bg-cosmic-purple flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.div>
        )}
      </motion.div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
            <Activity className="w-8 h-8 mr-3 text-cosmic-purple animate-pulse" />
            Dashboard
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full"
            >
              Live
            </motion.span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Last updated {formatDistance(new Date(), new Date(), { addSuffix: true })}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center flex-wrap gap-3"
        >
          {/* Timeframe selector */}
          <div className="flex items-center space-x-1 bg-dark-card rounded-xl p-1">
            {['today', 'week', 'month', 'year'].map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTimeframe(t as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  selectedTimeframe === t
                    ? 'bg-gradient-to-r from-cosmic-purple to-electric-blue text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </motion.button>
            ))}
          </div>

          {/* Export button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>

          {/* Refresh button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className={`p-2 glass-card hover:bg-dark-hover rounded-xl ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <HolographicKPICard
            key={card.id}
            card={card}
            onLongPress={() => handleKPILongPress(card)}
            onDoubleTap={() => handleKPIDoubleTap(card)}
            onSwipe={(direction) => handleKPISwipe(card, direction)}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <InteractiveChart
            data={salesData}
            onPointClick={(point) => toast.success(`Revenue: $${point.revenue.toLocaleString()}`)}
            onRangeSelect={handleRangeSelect}
          />
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1A1A24', border: '1px solid #333', borderRadius: '8px' }}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <button
              onClick={() => toast.success('View all orders')}
              className="text-sm text-cosmic-purple hover:text-electric-blue flex items-center"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <RecentOrdersTable
            orders={orders.slice(0, 5)}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Activity Feed & Insights */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">AI Insights</h2>
            <AIInsightsPanel
              insights={insights}
              onAction={handleInsightAction}
            />
          </div>

          {/* Activity Feed */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Activity Feed</h2>
            <GestureActivityFeed
              activities={activities}
              onDismiss={handleDismissActivity}
              onSnooze={handleSnoozeActivity}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Plus, label: 'New Product', color: 'from-purple-500 to-pink-500', action: () => toast.success('Creating new product') },
          { icon: Gift, label: 'Create Offer', color: 'from-blue-500 to-cyan-500', action: () => toast.success('Creating offer') },
          { icon: Truck, label: 'Track Orders', color: 'from-green-500 to-emerald-500', action: () => toast.success('Opening order tracker') },
          { icon: Users, label: 'View Customers', color: 'from-orange-500 to-red-500', action: () => toast.success('Opening customers') }
        ].map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            className="glass-card p-4 flex flex-col items-center justify-center group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
