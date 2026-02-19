import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, Search, Bell, User, Settings, LogOut,
  ChevronDown, Moon, Sun, Maximize2, Minimize2,
  Download, Upload, Filter, Plus, ShoppingBag,
  Package, TrendingUp, DollarSign, Users,
  AlertCircle, CheckCircle, Clock, Star,
  Mail, MessageSquare, HelpCircle, Wifi,
  WifiOff, Battery, BatteryCharging, Bluetooth,
  Volume2, VolumeX, X, Calendar, Grid,
  List, RefreshCw, Printer, Share2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useGestures } from '../../hooks/useGestures'

// ============= TYPES =============
interface HeaderProps {
  onMenuClick: () => void
  onSearch: (query: string) => void
  onNotificationClick: (id: string) => void
  onProfileClick: () => void
  onSettingsClick: () => void
  onLogout: () => void
  onThemeToggle: () => void
  onFullscreenToggle: () => void
  onViewChange?: (view: 'grid' | 'list') => void
  onExport?: () => void
  onImport?: () => void
  onRefresh?: () => void
  user: {
    name: string
    email: string
    avatar: string
    role: string
  }
  notifications: Notification[]
  unreadCount: number
  theme: 'dark' | 'light'
  isFullscreen: boolean
  connectionStatus: 'online' | 'offline' | 'reconnecting'
  batteryLevel?: number
  currentView?: 'grid' | 'list'
  showViewToggle?: boolean
  showExport?: boolean
  showImport?: boolean
  showRefresh?: boolean
  title?: string
  subtitle?: string
}

interface Notification {
  id: string
  type: 'order' | 'alert' | 'insight' | 'system'
  title: string
  message: string
  time: Date
  read: boolean
  icon?: React.ReactNode
  action?: {
    label: string
    handler: () => void
  }
}

interface SearchResult {
  id: string
  type: 'product' | 'order' | 'customer' | 'page'
  title: string
  subtitle: string
  icon: React.ElementType
  url: string
}

// ============= MOCK NOTIFICATIONS =============
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #ORD-12345 for $234.50',
    time: new Date(Date.now() - 1000 * 60 * 2),
    read: false,
    icon: <ShoppingBag className="w-4 h-4" />,
    action: {
      label: 'View Order',
      handler: () => toast.success('Opening order...')
    }
  },
  {
    id: '2',
    type: 'alert',
    title: 'Low Stock Alert',
    message: 'Wireless Headphones running low (3 left)',
    time: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    icon: <Package className="w-4 h-4" />,
    action: {
      label: 'Restock',
      handler: () => toast.success('Opening reorder...')
    }
  },
  {
    id: '3',
    type: 'insight',
    title: 'AI Insight',
    message: 'Sales up 23% this week. Consider restocking Electronics.',
    time: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    message: 'Dashboard updated to v2.0.0',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    icon: <Settings className="w-4 h-4" />
  }
]

// ============= SEARCH DATA =============
const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    id: 'p1',
    type: 'product',
    title: 'Wireless Headphones Pro',
    subtitle: 'Electronics • $89.99 • 45 in stock',
    icon: Package,
    url: '/products/p1'
  },
  {
    id: 'p2',
    type: 'product',
    title: 'Gaming Mouse X-1000',
    subtitle: 'Electronics • $59.99 • 23 in stock',
    icon: Package,
    url: '/products/p2'
  },
  {
    id: 'o1',
    type: 'order',
    title: 'Order #ORD-12345',
    subtitle: 'John Smith • $234.50 • Pending',
    icon: ShoppingBag,
    url: '/orders/o1'
  },
  {
    id: 'c1',
    type: 'customer',
    title: 'Sarah Johnson',
    subtitle: 'sarah.j@email.com • 12 orders • VIP',
    icon: Users,
    url: '/customers/c1'
  },
  {
    id: 'page1',
    type: 'page',
    title: 'Analytics Dashboard',
    subtitle: 'Sales reports and insights',
    icon: TrendingUp,
    url: '/analytics'
  }
]

// ============= NOTIFICATION ITEM COMPONENT =============
const NotificationItem: React.FC<{
  notification: Notification
  onClick: () => void
  onAction?: () => void
}> = ({ notification, onClick, onAction }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'from-blue-500 to-cyan-500'
      case 'alert': return 'from-orange-500 to-red-500'
      case 'insight': return 'from-purple-500 to-pink-500'
      case 'system': return 'from-gray-500 to-gray-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className={`p-4 border-b border-dark-border last:border-0 cursor-pointer hover:bg-dark-hover transition-colors ${
        !notification.read ? 'bg-cosmic-purple/5' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getTypeColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
          {notification.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-white truncate">
              {notification.title}
            </p>
            {!notification.read && (
              <span className="w-2 h-2 bg-cosmic-purple rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formatDistance(notification.time, new Date(), { addSuffix: true })}
            </span>
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  notification.action?.handler()
                  onAction?.()
                }}
                className="text-xs text-cosmic-purple hover:text-electric-blue"
              >
                {notification.action.label} →
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============= SEARCH OVERLAY COMPONENT =============
const SearchOverlay: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  onResultClick: (result: SearchResult) => void
}> = ({ isOpen, onClose, onSearch, onResultClick }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>(MOCK_SEARCH_RESULTS)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const [recentSearches] = useState([
    'Wireless Headphones',
    'Order #ORD-12345',
    'Sarah Johnson',
    'Analytics'
  ])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query) {
      // Filter results based on query
      const filtered = MOCK_SEARCH_RESULTS.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults(MOCK_SEARCH_RESULTS)
    }
    setSelectedIndex(-1)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      onResultClick(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-3 h-3" />
      case 'order': return <ShoppingBag className="w-3 h-3" />
      case 'customer': return <Users className="w-3 h-3" />
      case 'page': return <TrendingUp className="w-3 h-3" />
      default: return <Search className="w-3 h-3" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search panel */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, orders, customers..."
                  className="w-full bg-transparent border-none pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Recent searches */}
              {!query && recentSearches.length > 0 && (
                <div className="border-t border-dark-border p-4">
                  <p className="text-xs text-gray-400 mb-3">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(search)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-dark-hover hover:bg-cosmic-purple/20 rounded-full text-xs text-gray-300 transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search results */}
              {results.length > 0 ? (
                <div className="border-t border-dark-border max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-dark-hover transition-colors ${
                        index === selectedIndex ? 'bg-dark-hover' : ''
                      }`}
                      onClick={() => onResultClick(result)}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${
                        result.type === 'product' ? 'from-purple-500 to-pink-500' :
                        result.type === 'order' ? 'from-blue-500 to-cyan-500' :
                        result.type === 'customer' ? 'from-green-500 to-emerald-500' :
                        'from-orange-500 to-red-500'
                      } flex items-center justify-center`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-white">{result.title}</p>
                        <p className="text-xs text-gray-400">{result.subtitle}</p>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{result.type}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="border-t border-dark-border p-8 text-center">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No results found for "{query}"</p>
                  <p className="text-xs text-gray-500 mt-2">Try different keywords</p>
                </div>
              )}

              {/* Search tips */}
              <div className="border-t border-dark-border p-3 bg-dark-hover/50">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <span>↑↓ to navigate</span>
                  <span>↵ to select</span>
                  <span>esc to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============= MAIN HEADER COMPONENT =============
export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  onThemeToggle,
  onFullscreenToggle,
  onViewChange,
  onExport,
  onImport,
  onRefresh,
  user,
  notifications = MOCK_NOTIFICATIONS,
  unreadCount,
  theme,
  isFullscreen,
  connectionStatus,
  batteryLevel,
  currentView = 'grid',
  showViewToggle = false,
  showExport = false,
  showImport = false,
  showRefresh = false,
  title,
  subtitle
}) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const gestureHandlers = useGestures({
    onSwipe: (direction) => {
      if (direction === 'down') {
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const handleResultClick = (result: SearchResult) => {
    setShowSearch(false)
    toast.success(`Navigating to ${result.title}`)
    // Navigate to result.url
  }

  const markAllAsRead = () => {
    toast.success('All notifications marked as read')
    setShowNotifications(false)
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return <Wifi className="w-4 h-4 text-success-green" />
      case 'offline':
        return <WifiOff className="w-4 h-4 text-error-red" />
      case 'reconnecting':
        return <RefreshCw className="w-4 h-4 text-warning-orange animate-spin" />
    }
  }

  const getBatteryIcon = () => {
    if (!batteryLevel) return null
    if (batteryLevel > 90) return <BatteryCharging className="w-4 h-4 text-success-green" />
    if (batteryLevel > 20) return <Battery className="w-4 h-4 text-gray-400" />
    return <Battery className="w-4 h-4 text-error-red" />
  }

  return (
    <>
      <header className="sticky top-0 z-30 glass-card border-b border-dark-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </motion.button>

            {/* Page title */}
            <div>
              {title && (
                <h1 className="text-xl lg:text-2xl font-bold text-white">{title}</h1>
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Center section - Search */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Search or ask AI... (⌘K)"
                className="w-full bg-dark-hover border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none transition-colors"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2" {...gestureHandlers}>
            {/* Status indicators */}
            <div className="hidden lg:flex items-center space-x-3 mr-2">
              <div className="flex items-center space-x-1">
                {getConnectionIcon()}
                <span className="text-xs text-gray-400">
                  {connectionStatus === 'online' ? 'Connected' : 
                   connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
                </span>
              </div>
              
              {batteryLevel && (
                <div className="flex items-center space-x-1">
                  {getBatteryIcon()}
                  <span className="text-xs text-gray-400">{batteryLevel}%</span>
                </div>
              )}
            </div>

            {/* View toggle */}
            {showViewToggle && (
              <div className="flex items-center space-x-1 bg-dark-hover rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewChange?.('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentView === 'grid' ? 'bg-cosmic-purple text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewChange?.('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentView === 'list' ? 'bg-cosmic-purple text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={18} />
                </motion.button>
              </div>
            )}

            {/* Action buttons */}
            {showImport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onImport}
                className="p-2 hover:bg-dark-hover rounded-xl transition-colors"
                title="Import"
              >
                <Upload size={18} className="text-gray-400" />
              </motion.button>
            )}

            {showExport && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExport}
                className="p-2 hover:bg-dark-hover rounded-xl transition-colors"
                title="Export"
              >
                <Download size={18} className="text-gray-400" />
              </motion.button>
            )}

            {showRefresh && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRefresh}
                className="p-2 hover:bg-dark-hover rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} className="text-gray-400" />
              </motion.button>
            )}

            {/* Theme toggle */}
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={onThemeToggle}
              className="p-2 hover:bg-dark-hover rounded-xl transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-gray-400" />
              ) : (
                <Moon size={18} className="text-gray-400" />
              )}
            </motion.button>

            {/* Fullscreen toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFullscreenToggle}
              className="hidden lg:block p-2 hover:bg-dark-hover rounded-xl transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 size={18} className="text-gray-400" />
              ) : (
                <Maximize2 size={18} className="text-gray-400" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-dark-hover rounded-xl transition-colors"
              >
                <Bell size={18} className="text-gray-400" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-error-red rounded-full text-[10px] text-white flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-96 glass-card rounded-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-dark-border flex items-center justify-between">
                      <h3 className="text-white font-medium">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-cosmic-purple hover:text-electric-blue"
                        >
                          Mark all read
                        </button>
                        <span className="text-gray-500">|</span>
                        <button
                          onClick={() => {
                            setShowNotifications(false)
                            toast.success('Settings opened')
                          }}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Settings
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            notification={notif}
                            onClick={() => {
                              onNotificationClick(notif.id)
                              setShowNotifications(false)
                            }}
                            onAction={() => setShowNotifications(false)}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No notifications</p>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-dark-border bg-dark-hover/50">
                      <button
                        onClick={() => {
                          setShowNotifications(false)
                          toast.success('Viewing all notifications')
                        }}
                        className="w-full text-center text-sm text-cosmic-purple hover:text-electric-blue"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 hover:bg-dark-hover rounded-xl transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-cosmic-purple/50"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </motion.button>

              {/* User dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 glass-card rounded-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-dark-border">
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onProfileClick()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                    >
                      <User size={16} />
                      <span className="text-sm">Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onSettingsClick()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                    >
                      <Settings size={16} />
                      <span className="text-sm">Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        toast.success('Help opened')
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
                    >
                      <HelpCircle size={16} />
                      <span className="text-sm">Help</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onLogout()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-error-red hover:bg-error-red/10 transition-colors border-t border-dark-border"
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search or ask AI..."
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none"
              onFocus={() => setShowSearch(true)}
            />
          </div>
        </div>
      </header>

      {/* Search overlay */}
      <SearchOverlay
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSearch={handleSearch}
        onResultClick={handleResultClick}
      />
    </>
  )
}

// Helper function for time formatting
function formatDistance(date: Date, baseDate: Date, options?: { addSuffix?: boolean }): string {
  const diffMs = baseDate.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ${options?.addSuffix ? 'ago' : ''}`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${options?.addSuffix ? 'ago' : ''}`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ${options?.addSuffix ? 'ago' : ''}`
}

export default Header
