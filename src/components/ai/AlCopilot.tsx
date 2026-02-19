import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Send, X, Maximize2, Minimize2, Bot, User,
  TrendingUp, ShoppingBag, Package, Users, DollarSign,
  AlertCircle, CheckCircle, Clock, Star, Truck,
  Gift, Tag, CreditCard, BarChart3, PieChart,
  Zap, Shield, HelpCircle, ThumbsUp, ThumbsDown,
  Copy, Share2, Volume2, Mic, Settings, Download
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useGestures } from '../../hooks/useGestures'

// ============= TYPES =============
interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: Suggestion[]
  insights?: Insight[]
  actions?: Action[]
  data?: any
}

interface Suggestion {
  id: string
  text: string
  icon: React.ElementType
  query: string
  category: 'sales' | 'inventory' | 'customers' | 'orders' | 'marketing'
}

interface Insight {
  id: string
  title: string
  description: string
  value: string
  change: number
  trend: 'up' | 'down'
  icon: React.ElementType
  color: string
}

interface Action {
  id: string
  label: string
  icon: React.ElementType
  handler: () => void
}

// ============= AI RESPONSES DATABASE =============
const AI_RESPONSES = {
  greetings: [
    "👋 Welcome back! Your store is performing great today!",
    "✨ Ready to boost your sales? I've got some insights!",
    "📊 Revenue is up 23% this week! Want to know why?",
    "🎯 I've analyzed customer behavior. Want to see?",
    "🚀 Your best selling product just hit 1000 units!"
  ],

  sales: {
    revenue: [
      "Today's revenue is **$12,453**, which is **34% higher** than yesterday. Electronics is leading with $5,234 in sales.",
      "This month you're on track to hit **$189K** - your best month ever! The key driver is your new marketing campaign.",
      "Average order value is **$89.50**, up from $76.20 last month. Free shipping threshold at $100 is working!",
      "Abandoned cart recovery is at **23%** this week. I can send emails to 156 customers - potential recovery: $4,567."
    ],
    trends: [
      "🔥 **Hot trend**: Wireless headphones sales up 156% this week!",
      "📈 **Growing category**: Home office equipment up 89% month-over-month",
      "⭐ **Top rated**: Smart Watch Pro just hit 4.9 stars from 2,345 reviews",
      "🎯 **Best time**: Most orders come between 2-4 PM on weekdays"
    ],
    forecast: [
      "📊 Next month projection: **$234K** (±5% confidence)",
      "⚠️ Seasonal alert: Umbrella sales expected to spike 300% next week due to weather",
      "💰 Price optimization: Increasing 23 products by 10% could add $4,500 monthly profit"
    ]
  },

  inventory: {
    lowStock: [
      "🚨 **Critical**: Only 3 units left of 'Wireless Headphones Pro' - selling 12/day. Restock within 2 days!",
      "📦 **Low stock alert**: 23 products below threshold. Top 5: Gaming Mouse (3), USB-C Hub (5), Phone Cases (8)",
      "⚡ **Fast movers**: These 5 products are selling 3x faster than usual and need reordering"
    ],
    restock: [
      "📋 **Restock recommendations**: Order 50 units of Headphones, 30 Mice, 25 Keyboards",
      "🔄 **Reorder point**: 12 products hit minimum stock today. Ready to generate purchase orders?",
      "🏭 **Supplier performance**: TechPro delivers 98% on time, SoundMaster only 82% - consider switching"
    ],
    deadStock: [
      "🐢 **Slow movers**: 5 products haven't sold in 90 days. Consider discounting to clear inventory",
      "📉 **Overstock alert**: 23 units of Vintage Camera - 0 sales in 60 days. Time for clearance?"
    ]
  },

  customers: {
    segments: [
      "👑 **VIP customers** (top 10%) spent $45,678 this month. Want to see their purchase patterns?",
      "🌟 **Loyalty tier update**: 23 customers just reached Gold status! Send welcome emails?",
      "🎂 **Birthday reminders**: 12 customers have birthdays this week. Send personalized offers?"
    ],
    behavior: [
      "📊 **Customer analysis**: 45% of revenue comes from 12% of customers",
      "🔄 **Repeat rate**: 34% of customers purchase again within 30 days",
      "💎 **High value**: 23 customers have lifetime value over $5,000"
    ],
    atRisk: [
      "⚠️ **At-risk customers**: 156 haven't purchased in 60+ days. Win-back campaign ready!",
      "💔 **Churn prediction**: 12 VIP customers showing signs of churn. Offer exclusive discounts?"
    ]
  },

  orders: {
    pending: [
      "📦 **Pending orders**: 45 orders need processing worth $12,345",
      "⏳ **Delayed**: 3 orders are past delivery date. Contact customers?",
      "🔄 **Processing**: 23 orders are being packed, ready for shipping"
    ],
    fulfillment: [
      "🚚 **Ready to ship**: 67 orders packed and labeled. Print shipping labels?",
      "📬 **Tracking updates**: 45 orders were delivered yesterday",
      "⚠️ **Issues**: 2 orders have payment problems. Review now?"
    ],
    returns: [
      "🔄 **Returns**: 5 returns today ($567). Top reason: 'Wrong size' (40%)",
      "📦 **Exchange requests**: 3 customers want exchanges. Process now?"
    ]
  },

  marketing: [
    "📧 **Email campaign**: Your last email had 45% open rate (industry avg 21%)",
    "📱 **SMS campaign**: Text subscribers converted at 12% - 3x better than email",
    "🎯 **Abandoned cart**: 156 carts abandoned. Recovery sequence ready!",
    "💰 **ROI analysis**: Facebook ads generating 4.5x ROAS, Google 3.2x"
  ],

  predictions: [
    "🔮 **Next week**: Sales projected to increase 23% due to upcoming holiday",
    "📈 **Growth forecast**: Electronics category will grow 45% this quarter",
    "⚠️ **Risk alert**: 3 high-value orders flagged for potential fraud",
    "💡 **Opportunity**: 156 customers viewed but didn't buy - send reminder?"
  ],

  quickActions: [
    {
      label: "Create discount",
      query: "Create 20% off sale for Electronics",
      icon: Tag
    },
    {
      label: "Check inventory",
      query: "Show me low stock items",
      icon: Package
    },
    {
      label: "Revenue report",
      query: "Show today's revenue",
      icon: DollarSign
    },
    {
      label: "Customer insights",
      query: "Who are my VIP customers?",
      icon: Users
    }
  ],

  fun: [
    "🎮 Did you know? Your store processes 1.2 orders per minute!",
    "⭐ Fun fact: Your best customer has ordered 23 times!",
    "📊 Nerdy stat: Your conversion rate is 23% above industry average!",
    "🎯 Pro tip: Customers love free shipping - offer it at $100!"
  ]
}

// ============= SUGGESTIONS =============
const SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    text: 'How are sales today?',
    icon: TrendingUp,
    query: 'Show me today\'s sales',
    category: 'sales'
  },
  {
    id: '2',
    text: 'Low stock items',
    icon: Package,
    query: 'What products are low in stock?',
    category: 'inventory'
  },
  {
    id: '3',
    text: 'VIP customers',
    icon: Users,
    query: 'Show me my VIP customers',
    category: 'customers'
  },
  {
    id: '4',
    text: 'Pending orders',
    icon: ShoppingBag,
    query: 'How many pending orders?',
    category: 'orders'
  },
  {
    id: '5',
    text: 'Revenue forecast',
    icon: BarChart3,
    query: 'Predict next month revenue',
    category: 'sales'
  },
  {
    id: '6',
    text: 'Best sellers',
    icon: Star,
    query: 'What are my best selling products?',
    category: 'inventory'
  },
  {
    id: '7',
    text: 'Abandoned carts',
    icon: ShoppingBag,
    query: 'Show abandoned carts',
    category: 'marketing'
  },
  {
    id: '8',
    text: 'Create campaign',
    icon: Gift,
    query: 'Help me create a marketing campaign',
    category: 'marketing'
  }
]

// ============= INSIGHTS =============
const LIVE_INSIGHTS: Insight[] = [
  {
    id: '1',
    title: 'Revenue Surge',
    description: 'Electronics up 45% this week',
    value: '+$23.4K',
    change: 45,
    trend: 'up',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    description: '5 products running low',
    value: 'Restock soon',
    change: -23,
    trend: 'down',
    icon: AlertCircle,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: '3',
    title: 'VIP Milestone',
    description: '3 new VIP customers',
    value: '+$12K',
    change: 34,
    trend: 'up',
    icon: Star,
    color: 'from-yellow-500 to-amber-500'
  }
]

// ============= MESSAGE COMPONENT =============
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
        <div className="flex items-start space-x-2">
          {message.type === 'ai' && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-purple to-electric-blue flex-shrink-0 flex items-center justify-center"
            >
              <Bot className="w-4 h-4 text-white" />
            </motion.div>
          )}
          
          <div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-cosmic-purple text-white rounded-br-none'
                  : 'bg-dark-hover text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </motion.div>

            {/* Message actions */}
            <div className="flex items-center justify-end space-x-2 mt-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                {isCopied ? (
                  <CheckCircle className="w-3 h-3 text-success-green" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <ThumbsUp className="w-3 h-3 text-gray-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <ThumbsDown className="w-3 h-3 text-gray-500" />
              </motion.button>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Insights */}
            {message.insights && message.insights.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.insights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl bg-gradient-to-r ${insight.color} bg-opacity-10 border border-opacity-20`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <insight.icon className="w-4 h-4 text-white" />
                        <span className="text-xs font-medium text-white">{insight.title}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{insight.value}</span>
                    </div>
                    <p className="text-xs text-gray-300">{insight.description}</p>
                    <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.abs(insight.change)}%` }}
                        className={`h-full ${
                          insight.trend === 'up' ? 'bg-success-green' : 'bg-error-red'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {message.type === 'user' && (
            <div className="w-8 h-8 rounded-full bg-cosmic-purple/20 flex-shrink-0 flex items-center justify-center">
              <User className="w-4 h-4 text-cosmic-purple" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============= AI RESPONSE GENERATOR =============
const generateAIResponse = (query: string): Message => {
  const lowerQuery = query.toLowerCase()
  let content = ''
  let insights: Insight[] = []

  // Sales related
  if (lowerQuery.includes('sale') || lowerQuery.includes('revenue') || lowerQuery.includes('money')) {
    content = AI_RESPONSES.sales.revenue[Math.floor(Math.random() * AI_RESPONSES.sales.revenue.length)]
    insights = [LIVE_INSIGHTS[0]]
  }
  // Inventory related
  else if (lowerQuery.includes('stock') || lowerQuery.includes('inventory') || lowerQuery.includes('product')) {
    content = AI_RESPONSES.inventory.lowStock[Math.floor(Math.random() * AI_RESPONSES.inventory.lowStock.length)]
    insights = [LIVE_INSIGHTS[1]]
  }
  // Customer related
  else if (lowerQuery.includes('customer') || lowerQuery.includes('vip') || lowerQuery.includes('who')) {
    content = AI_RESPONSES.customers.segments[Math.floor(Math.random() * AI_RESPONSES.customers.segments.length)]
    insights = [LIVE_INSIGHTS[2]]
  }
  // Order related
  else if (lowerQuery.includes('order') || lowerQuery.includes('pending') || lowerQuery.includes('ship')) {
    content = AI_RESPONSES.orders.pending[Math.floor(Math.random() * AI_RESPONSES.orders.pending.length)]
  }
  // Forecast related
  else if (lowerQuery.includes('predict') || lowerQuery.includes('forecast') || lowerQuery.includes('future')) {
    content = AI_RESPONSES.predictions[Math.floor(Math.random() * AI_RESPONSES.predictions.length)]
  }
  // Marketing related
  else if (lowerQuery.includes('market') || lowerQuery.includes('campaign') || lowerQuery.includes('email')) {
    content = AI_RESPONSES.marketing[Math.floor(Math.random() * AI_RESPONSES.marketing.length)]
  }
  // Greeting
  else if (lowerQuery.includes('hi') || lowerQuery.includes('hello') || lowerQuery.includes('hey')) {
    content = AI_RESPONSES.greetings[Math.floor(Math.random() * AI_RESPONSES.greetings.length)]
  }
  // Fun fact
  else if (lowerQuery.includes('fun') || lowerQuery.includes('joke') || lowerQuery.includes('fact')) {
    content = AI_RESPONSES.fun[Math.floor(Math.random() * AI_RESPONSES.fun.length)]
  }
  // Default
  else {
    content = `I understand you're asking about "${query}". Based on your data, I can help with:\n\n• 📊 Sales reports and forecasts\n• 📦 Inventory management\n• 👥 Customer insights\n• 🚚 Order tracking\n• 💰 Revenue optimization\n\nWhat specific area would you like to explore?`
  }

  return {
    id: Date.now().toString(),
    type: 'ai',
    content,
    timestamp: new Date(),
    insights: insights.length > 0 ? insights : undefined
  }
}

// ============= MAIN COPILOT COMPONENT =============
export const AICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: "👋 Hi! I'm your AI Copilot. I can help you with sales data, inventory alerts, customer insights, and more. What would you like to know?",
      timestamp: new Date(),
      insights: LIVE_INSIGHTS
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setShowSuggestions(false)

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate AI response
    const aiResponse = generateAIResponse(inputValue)
    setMessages(prev => [...prev, aiResponse])
    setIsTyping(false)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion.query)
    handleSendMessage()
  }

  // Gesture handlers
  const gestureHandlers = useGestures({
    onSwipe: (direction) => {
      if (direction === 'down' && !isMinimized) {
        setIsMinimized(true)
      }
      if (direction === 'up' && isMinimized) {
        setIsMinimized(false)
      }
    }
  })

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="absolute inset-0 bg-cosmic-purple rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
        <div className="relative bg-gradient-to-r from-cosmic-purple to-electric-blue p-4 rounded-full shadow-2xl">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-success-green rounded-full border-2 border-dark-bg animate-pulse" />
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-dark-card text-white text-sm px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Ask AI Copilot
        </span>
      </motion.button>
    )
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="glass-card border border-cosmic-purple/30 rounded-2xl overflow-hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center space-x-3 px-4 py-3 hover:bg-dark-hover transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-purple to-electric-blue flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-green rounded-full border-2 border-dark-card animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-white font-medium block">AI Copilot</span>
              <span className="text-xs text-gray-400">3 insights available</span>
            </div>
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-6 right-6 w-96 z-50"
      {...gestureHandlers}
    >
      {/* Chat window */}
      <div className="glass-card border border-cosmic-purple/30 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-cosmic-purple to-electric-blue p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-green rounded-full border-2 border-cosmic-purple animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-semibold">AI Copilot</h3>
                <p className="text-white/70 text-xs">Always learning • 500+ responses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Live insights bar */}
        <div className="bg-dark-hover/50 border-b border-dark-border px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-xs text-gray-300">Live insights</span>
            </div>
            <div className="flex -space-x-1">
              {LIVE_INSIGHTS.map((insight, i) => (
                <motion.div
                  key={insight.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-6 h-6 rounded-full bg-gradient-to-r ${insight.color} flex items-center justify-center border-2 border-dark-card`}
                  title={insight.title}
                >
                  {React.createElement(insight.icon, { className: "w-3 h-3 text-white" })}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-dark-card/50">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cosmic-purple to-electric-blue flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-dark-hover rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 border-t border-dark-border"
            >
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.slice(0, 4).map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-hover hover:bg-cosmic-purple/20 rounded-full text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    <suggestion.icon className="w-3 h-3" />
                    <span>{suggestion.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t border-dark-border">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-2.5 bg-dark-hover rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </motion.button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-dark-hover border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cosmic-purple transition-colors"
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-2.5 bg-gradient-to-r from-cosmic-purple to-electric-blue rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cosmic-purple/20 transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Ask about sales, inventory, customers, orders...
            </p>
            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Mic className="w-3 h-3 text-gray-500" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Settings className="w-3 h-3 text-gray-500" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AICopilot
