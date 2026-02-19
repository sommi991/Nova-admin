import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  BarChart3, Settings, Sparkles, ChevronDown, 
  ChevronLeft, ChevronRight, LogOut, User,
  HelpCircle, Moon, Sun, Bell, Search,
  ShoppingBag, Gift, Tag, CreditCard, TrendingUp,
  Star, Award, Zap, Shield, Globe, Clock,
  X, Menu, Plus, Download, Upload, Filter
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useGestures } from '../../hooks/useGestures'

// ============= TYPES =============
interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  path: string
  badge?: number | string
  badgeColor?: string
  children?: NavItem[]
  permissions?: string[]
}

interface Store {
  id: string
  name: string
  logo: string
  currency: string
  timezone: string
  status: 'active' | 'maintenance' | 'inactive'
  products: number
  orders: number
  revenue: number
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  permissions: string[]
  store: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onToggle: () => void
  currentPath: string
  onNavigate: (path: string) => void
  user: User
  stores: Store[]
  onStoreChange: (storeId: string) => void
  onLogout: () => void
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

// ============= NAVIGATION ITEMS =============
const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    badge: 'Live',
    badgeColor: 'success'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    path: '/products',
    badge: 234,
    badgeColor: 'purple'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    path: '/orders',
    badge: 12,
    badgeColor: 'orange'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    path: '/customers',
    badge: '1.2k',
    badgeColor: 'blue'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics'
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: TrendingUp,
    path: '/marketing',
    children: [
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: Gift,
        path: '/marketing/campaigns'
      },
      {
        id: 'discounts',
        label: 'Discounts',
        icon: Tag,
        path: '/marketing/discounts'
      },
      {
        id: 'reviews',
        label: 'Reviews',
        icon: Star,
        path: '/marketing/reviews',
        badge: 23,
        badgeColor: 'yellow'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  }
]

// ============= STORE DATA =============
const MOCK_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'NOVA Electronics',
    logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=50&h=50&fit=crop',
    currency: 'USD',
    timezone: 'America/New_York',
    status: 'active',
    products: 1234,
    orders: 456,
    revenue: 124567
  },
  {
    id: 'store-2',
    name: 'NOVA Fashion',
    logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=50&h=50&fit=crop',
    currency: 'USD',
    timezone: 'America/New_York',
    status: 'active',
    products: 2345,
    orders: 789,
    revenue: 234567
  },
  {
    id: 'store-3',
    name: 'NOVA Sports',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=50&h=50&fit=crop',
    currency: 'USD',
    timezone: 'America/Chicago',
    status: 'maintenance',
    products: 567,
    orders: 123,
    revenue: 45678
  }
]

// ============= NAV ITEM COMPONENT =============
const NavItemComponent: React.FC<{
  item: NavItem
  isActive: boolean
  depth?: number
  onNavigate: (path: string) => void
}> = ({ item, isActive, depth = 0, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    } else {
      onNavigate(item.path)
    }
  }

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'success': return 'bg-success-green/10 text-success-green'
      case 'purple': return 'bg-cosmic-purple/10 text-cosmic-purple'
      case 'orange': return 'bg-warning-orange/10 text-warning-orange'
      case 'blue': return 'bg-electric-blue/10 text-electric-blue'
      case 'yellow': return 'bg-gold/10 text-gold'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  return (
    <div>
      <motion.button
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
          isActive
            ? 'bg-gradient-to-r from-cosmic-purple to-electric-blue text-white shadow-lg shadow-cosmic-purple/20'
            : 'text-gray-400 hover:text-white hover:bg-dark-hover'
        }`}
        style={{ paddingLeft: `${depth * 16 + 16}px` }}
      >
        <div className="flex items-center space-x-3">
          <item.icon size={20} />
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {item.badge && (
            <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(item.badgeColor)}`}>
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.id}
                item={child}
                isActive={false}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============= STORE SELECTOR COMPONENT =============
const StoreSelector: React.FC<{
  stores: Store[]
  currentStore: Store
  onStoreChange: (storeId: string) => void
}> = ({ stores, currentStore, onStoreChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const gestureHandlers = useGestures({
    onSwipe: (direction) => {
      if (direction === 'left' && isOpen) setIsOpen(false)
    }
  })

  return (
    <div className="relative" {...gestureHandlers}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-4 rounded-xl text-left hover:bg-dark-hover transition-colors group"
      >
        <div className="flex items-center space-x-3">
          <img
            src={currentStore.logo}
            alt={currentStore.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="text-xs text-gray-400">Current Store</p>
            <p className="text-white font-medium">{currentStore.name}</p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">Products</p>
            <p className="text-sm text-white font-medium">{currentStore.products}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Orders</p>
            <p className="text-sm text-white font-medium">{currentStore.orders}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Revenue</p>
            <p className="text-sm text-white font-medium">${(currentStore.revenue / 1000).toFixed(0)}k</p>
          </div>
        </div>
      </motion.button>

      {/* Store dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-50"
          >
            {stores.map((store) => (
              <motion.button
                key={store.id}
                whileHover={{ x: 5 }}
                onClick={() => {
                  onStoreChange(store.id)
                  setIsOpen(false)
                  toast.success(`Switched to ${store.name}`)
                }}
                className={`w-full flex items-center space-x-3 p-4 hover:bg-dark-hover transition-colors ${
                  store.id === currentStore.id ? 'bg-cosmic-purple/20' : ''
                }`}
              >
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">{store.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      store.status === 'active' 
                        ? 'bg-success-green/10 text-success-green'
                        : 'bg-warning-orange/10 text-warning-orange'
                    }`}>
                      {store.status}
                    </span>
                    <span className="text-xs text-gray-400">{store.products} products</span>
                  </div>
                </div>
                {store.id === currentStore.id && (
                  <div className="w-2 h-2 bg-cosmic-purple rounded-full" />
                )}
              </motion.button>
            ))}

            <button
              onClick={() => {
                setIsOpen(false)
                toast.success('Opening store creator...')
              }}
              className="w-full p-4 border-t border-dark-border text-cosmic-purple hover:bg-dark-hover transition-colors text-sm"
            >
              + Add New Store
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============= USER MENU COMPONENT =============
const UserMenu: React.FC<{
  user: User
  onLogout: () => void
  onThemeToggle: () => void
  theme: 'dark' | 'light'
}> = ({ user, onLogout, onThemeToggle, theme }) => {
  const [isOpen, setIsOpen] = useState(false)

  const gestureHandlers = useGestures({
    onSwipe: (direction) => {
      if (direction === 'down' && isOpen) setIsOpen(false)
    }
  })

  return (
    <div className="relative" {...gestureHandlers}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-dark-hover transition-colors group"
      >
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-cosmic-purple/50"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-green rounded-full ring-2 ring-dark-card" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{user.role}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* User dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 glass-card rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-dark-border">
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400 mt-1">{user.email}</p>
              <p className="text-xs text-gray-500 mt-1">Store: {user.store}</p>
            </div>

            <button
              onClick={() => {
                setIsOpen(false)
                toast.success('Opening profile...')
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <User size={16} />
              <span className="text-sm">Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                toast.success('Opening settings...')
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <Settings size={16} />
              <span className="text-sm">Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                onThemeToggle()
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                toast.success('Opening help...')
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <HelpCircle size={16} />
              <span className="text-sm">Help & Support</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
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
  )
}

// ============= QUICK ACTIONS =============
const QuickActions: React.FC = () => {
  const actions = [
    { icon: Plus, label: 'Add Product', color: 'from-green-500 to-emerald-500', onClick: () => toast.success('Add product') },
    { icon: Download, label: 'Import', color: 'from-blue-500 to-cyan-500', onClick: () => toast.success('Import') },
    { icon: Upload, label: 'Export', color: 'from-purple-500 to-pink-500', onClick: () => toast.success('Export') },
    { icon: Filter, label: 'Filter', color: 'from-orange-500 to-red-500', onClick: () => toast.success('Filter') }
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="p-2 bg-dark-hover rounded-lg text-center group"
        >
          <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-1 group-hover:rotate-6 transition-transform`}>
            <action.icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs text-gray-400">{action.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

// ============= MAIN SIDEBAR COMPONENT =============
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onToggle,
  currentPath,
  onNavigate,
  user,
  stores,
  onStoreChange,
  onLogout,
  theme,
  onThemeToggle
}) => {
  const [currentStore, setCurrentStore] = useState<Store>(stores[0])

  const handleStoreChange = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (store) {
      setCurrentStore(store)
      onStoreChange(storeId)
    }
  }

  // Gesture for mobile
  const gestureHandlers = useGestures({
    onSwipe: (direction) => {
      if (direction === 'left' && isOpen) onClose()
    }
  })

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30 }}
        className={`fixed top-0 left-0 z-50 h-full w-72 glass-card border-r border-dark-border overflow-hidden flex flex-col`}
        {...gestureHandlers}
      >
        {/* Header with logo */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cosmic-purple to-electric-blue rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white">NOVA</span>
              <span className="text-xs text-gray-400 block">E-Commerce</span>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              className="hidden lg:block text-gray-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </motion.button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Store selector */}
          <StoreSelector
            stores={stores}
            currentStore={currentStore}
            onStoreChange={handleStoreChange}
          />

          {/* Quick actions */}
          <QuickActions />

          {/* Navigation */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={currentPath === item.path}
                onNavigate={onNavigate}
              />
            ))}
          </nav>

          {/* Notifications preview */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cosmic-purple" />
                <span className="text-white text-sm font-medium">Notifications</span>
              </div>
              <span className="text-xs bg-cosmic-purple/20 text-cosmic-purple px-2 py-1 rounded-full">
                3 new
              </span>
            </div>
            <div className="space-y-2">
              <motion.button
                whileHover={{ x: 5 }}
                className="w-full text-left p-2 bg-dark-hover rounded-lg hover:bg-cosmic-purple/20 transition-colors"
              >
                <p className="text-xs text-white">New order received</p>
                <p className="text-xs text-gray-400 mt-1">2 min ago</p>
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="w-full text-left p-2 bg-dark-hover rounded-lg hover:bg-cosmic-purple/20 transition-colors"
              >
                <p className="text-xs text-white">Low stock alert</p>
                <p className="text-xs text-gray-400 mt-1">15 min ago</p>
              </motion.button>
            </div>
          </div>
        </div>

        {/* User menu */}
        <div className="p-4 border-t border-dark-border">
          <UserMenu
            user={user}
            onLogout={onLogout}
            onThemeToggle={onThemeToggle}
            theme={theme}
          />

          {/* Version info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            NOVA Dashboard v2.0 • © 2026
          </p>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar
