import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { Toaster, toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
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
  Moon, Sun, LogOut, User, Menu, Wifi, WifiOff,
  Battery, BatteryCharging, Bluetooth, Volume2, VolumeX,
  Sparkles, Bot, MessageSquare, FileText, Home
} from 'lucide-react'

// ============================================================================
// LAZY LOAD PAGES FOR PERFORMANCE
// ============================================================================

const Dashboard = lazy(() => import('@pages/Dashboard'))
const Products = lazy(() => import('@pages/Products'))
const Orders = lazy(() => import('@pages/Orders'))
const Customers = lazy(() => import('@pages/Customers'))
const Analytics = lazy(() => import('@pages/Analytics'))
const Settings = lazy(() => import('@pages/Settings'))
const Profile = lazy(() => import('@pages/Profile'))
const Login = lazy(() => import('@pages/Login'))
const AICopilot = lazy(() => import('@components/ai/AICopilot'))

// ============================================================================
// COMPONENTS
// ============================================================================

import { Sidebar } from '@components/layout/Sidebar'
import { Header } from '@components/layout/Header'
import { Modal, ConfirmModal } from '@components/shared/Modal'
import { Toast } from '@components/shared/Toast'
import { DataTable } from '@components/shared/DataTable'
import { LoadingScreen } from '@components/shared/LoadingScreen'
import { ErrorBoundary } from '@components/shared/ErrorBoundary'

// ============================================================================
// STORES
// ============================================================================

import { useUserStore } from '@store/store'
import { useUIStore } from '@store/store'
import { useProductStore } from '@store/store'
import { useCartStore } from '@store/store'

// ============================================================================
// TYPES
// ============================================================================

import type { Store, User, Notification, ConnectionStatus } from '@types'

// ============================================================================
// MOCK DATA
// ============================================================================

import { generateMockData } from '@utils/mockData'

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // ==========================================================================
  // STORE STATE
  // ==========================================================================

  const userState = useUserStore()
  const uiState = useUIStore()
  const productState = useProductStore()
  const cartState = useCartStore()

  // ==========================================================================
  // LOCAL STATE
  // ==========================================================================

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online')
  const [batteryLevel, setBatteryLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentPath, setCurrentPath] = useState('/')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // ==========================================================================
  // REFS
  // ==========================================================================

  const notificationSound = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        // Generate mock data
        const mockData = generateMockData()
        console.log('📊 Mock data generated:', mockData)

        // Check for saved auth
        const savedAuth = localStorage.getItem('nova-auth')
        if (savedAuth) {
          const { email, password } = JSON.parse(savedAuth)
          await userState.login(email, password)
          setIsAuthenticated(true)
        }

        // Check battery status
        if ('getBattery' in navigator) {
          // @ts-ignore
          navigator.getBattery().then((battery: any) => {
            setBatteryLevel(battery.level * 100)
            battery.addEventListener('levelchange', () => {
              setBatteryLevel(battery.level * 100)
              if (battery.level < 0.2) {
                uiState.addToast({
                  type: 'warning',
                  message: 'Battery low! Consider enabling power saving mode',
                  duration: 5000
                })
              }
            })
          })
        }

        // Load user preferences
        const savedPrefs = localStorage.getItem('nova-preferences')
        if (savedPrefs) {
          // Apply preferences
          const prefs = JSON.parse(savedPrefs)
          if (prefs.theme === 'light') {
            document.documentElement.classList.remove('dark')
          }
        }

        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsLoading(false)
      }
    }

    init()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Network status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online')
      uiState.addToast({
        type: 'success',
        message: 'Connection restored!',
        duration: 3000
      })
    }

    const handleOffline = () => {
      setConnectionStatus('offline')
      uiState.addToast({
        type: 'error',
        message: 'You are offline. Some features may be limited.',
        duration: 0
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        uiState.addToast({
          type: 'info',
          message: 'Search opened (Ctrl+K)',
          duration: 2000
        })
      }

      // Ctrl/Cmd + B - Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        uiState.setSidebarOpen(!uiState.sidebarOpen)
      }

      // Ctrl/Cmd + N - New product
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        uiState.addToast({
          type: 'success',
          message: 'Creating new product...',
          duration: 2000
        })
      }

      // ? - Show shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        uiState.addToast({
          type: 'info',
          message: (
            <div className="space-y-2">
              <p className="font-bold">Keyboard Shortcuts:</p>
              <p>⌘K - Search</p>
              <p>⌘B - Toggle sidebar</p>
              <p>⌘N - New product</p>
              <p>⌘/ - Show this menu</p>
            </div>
          ),
          duration: 5000
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [uiState.sidebarOpen])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleLogin = async (email: string, password: string) => {
    try {
      await userState.login(email, password)
      setIsAuthenticated(true)
      
      // Save auth if remember me
      if (email === 'demo@nova.com' && password === 'demo123') {
        localStorage.setItem('nova-auth', JSON.stringify({ email, password }))
      }

      uiState.addToast({
        type: 'success',
        message: `Welcome back, ${userState.name}!`,
        duration: 4000
      })
    } catch (error) {
      uiState.addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Login failed',
        duration: 4000
      })
    }
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    userState.logout()
    setIsAuthenticated(false)
    localStorage.removeItem('nova-auth')
    setShowLogoutConfirm(false)
    uiState.addToast({
      type: 'success',
      message: 'Logged out successfully',
      duration: 3000
    })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleRefresh = () => {
    uiState.setLoading('refresh', true)
    setTimeout(() => {
      uiState.setLoading('refresh', false)
      uiState.addToast({
        type: 'success',
        message: 'Dashboard refreshed!',
        duration: 3000
      })
    }, 1500)
  }

  // ==========================================================================
  // RENDER LOADING
  // ==========================================================================

  if (isLoading) {
    return <LoadingScreen />
  }

  // ==========================================================================
  // RENDER LOGIN
  // ==========================================================================

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Login onLogin={handleLogin} />
      </Suspense>
    )
  }

  // ==========================================================================
  // RENDER MAIN APP
  // ==========================================================================

  return (
    <ErrorBoundary>
      <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
        <Router>
          <div className={`min-h-screen ${uiState.theme === 'dark' ? 'dark bg-dark-bg' : 'bg-light-bg'}`}>
            {/* Toaster for notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: uiState.theme === 'dark' ? '#1A1A24' : '#fff',
                  color: uiState.theme === 'dark' ? '#fff' : '#000',
                  border: `1px solid ${uiState.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }
              }}
            />

            {/* Custom toast container */}
            <Toast position="top-right" />

            {/* Connection status bar */}
            <AnimatePresence>
              {connectionStatus !== 'online' && (
                <motion.div
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  exit={{ y: -100 }}
                  className={`fixed top-0 left-0 right-0 z-50 py-2 text-center text-sm ${
                    connectionStatus === 'offline'
                      ? 'bg-error-red text-white'
                      : 'bg-warning-orange text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {connectionStatus === 'offline' ? (
                      <>
                        <WifiOff className="w-4 h-4" />
                        <span>You are offline. Reconnecting...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Reconnecting...</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sidebar */}
            <Sidebar
              isOpen={uiState.sidebarOpen}
              onClose={() => uiState.setSidebarOpen(false)}
              onToggle={() => uiState.setSidebarOpen(!uiState.sidebarOpen)}
              currentPath={currentPath}
              onNavigate={(path) => {
                setCurrentPath(path)
                if (isMobile) uiState.setSidebarOpen(false)
              }}
              user={{
                id: userState.id || '',
                name: userState.name || '',
                email: userState.email || '',
                avatar: userState.avatar || '',
                role: userState.role || 'viewer',
                permissions: userState.permissions || [],
                store: 'NOVA Electronics'
              }}
              stores={[
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
                }
              ]}
              onStoreChange={(storeId) => {
                uiState.addToast({
                  type: 'success',
                  message: `Switched to ${storeId === 'store-1' ? 'NOVA Electronics' : 'NOVA Fashion'}`,
                  duration: 2000
                })
              }}
              onLogout={handleLogout}
              theme={uiState.theme}
              onThemeToggle={() => uiState.toggleTheme()}
            />

            {/* Main content */}
            <main className={`transition-all ${uiState.sidebarOpen ? 'lg:pl-72' : ''}`}>
              {/* Header */}
              <Header
                onMenuClick={() => uiState.setSidebarOpen(true)}
                onSearch={(query) => console.log('Search:', query)}
                onNotificationClick={(id) => console.log('Notification:', id)}
                onProfileClick={() => setCurrentPath('/profile')}
                onSettingsClick={() => setCurrentPath('/settings')}
                onLogout={handleLogout}
                onThemeToggle={() => uiState.toggleTheme()}
                onFullscreenToggle={toggleFullscreen}
                onRefresh={handleRefresh}
                user={{
                  name: userState.name || 'John Doe',
                  email: userState.email || 'john@nova.com',
                  avatar: userState.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
                  role: userState.role || 'Admin'
                }}
                notifications={[
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
                      handler: () => uiState.addToast({ type: 'info', message: 'Opening order...' })
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
                      handler: () => uiState.addToast({ type: 'info', message: 'Opening reorder...' })
                    }
                  }
                ]}
                unreadCount={2}
                theme={uiState.theme}
                isFullscreen={isFullscreen}
                connectionStatus={connectionStatus}
                batteryLevel={batteryLevel}
              />

              {/* Page content */}
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>

            {/* Floating AI Copilot */}
            <AICopilot />

            {/* Logout confirmation modal */}
            <ConfirmModal
              isOpen={showLogoutConfirm}
              onClose={() => setShowLogoutConfirm(false)}
              title="Logout"
              message="Are you sure you want to logout?"
              confirmLabel="Logout"
              cancelLabel="Cancel"
              confirmVariant="danger"
              icon="warning"
              onConfirm={confirmLogout}
              onCancel={() => setShowLogoutConfirm(false)}
            />

            {/* Loading overlay */}
            <AnimatePresence>
              {uiState.loading['global'] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
                >
                  <div className="glass-card p-8 text-center">
                    <div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Loading...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Router>
      </DndProvider>
    </ErrorBoundary>
  )
}

export default App
