import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles,
  ShoppingBag, TrendingUp, Users, Package, Star,
  Shield, Zap, Globe, Clock, CreditCard, Truck
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Demo accounts for instant access
const DEMO_ACCOUNTS = [
  {
    email: 'admin@nova.com',
    password: 'demo123',
    role: 'Admin',
    store: 'NOVA Electronics',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop'
  },
  {
    email: 'manager@nova.com',
    password: 'demo123',
    role: 'Manager',
    store: 'NOVA Fashion',
    avatar: 'https://images.unsplash.com/photo-1494790108777-7669c5f07f99?w=150&h=150&fit=crop'
  },
  {
    email: 'viewer@nova.com',
    password: 'demo123',
    role: 'Viewer',
    store: 'NOVA Sports',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop'
  }
]

// Features carousel data
const FEATURES = [
  {
    icon: ShoppingBag,
    title: 'Smart Inventory',
    description: 'AI-powered stock management with predictive alerts',
    color: 'from-purple-500 to-pink-500',
    stats: '23,456 products tracked'
  },
  {
    icon: TrendingUp,
    title: 'Real-time Analytics',
    description: 'Live sales data with 3D visualizations',
    color: 'from-blue-500 to-cyan-500',
    stats: '$124K revenue today'
  },
  {
    icon: Users,
    title: 'Customer 360',
    description: 'Complete customer profiles with AI insights',
    color: 'from-green-500 to-emerald-500',
    stats: '8,947 active customers'
  },
  {
    icon: Package,
    title: 'Order Management',
    description: 'Drag-drop Kanban with gesture controls',
    color: 'from-orange-500 to-red-500',
    stats: '1,243 orders today'
  },
  {
    icon: CreditCard,
    title: 'Multi-store Support',
    description: 'Manage multiple stores from one dashboard',
    color: 'from-indigo-500 to-purple-500',
    stats: '5 stores connected'
  },
  {
    icon: Truck,
    title: 'Shipping Integration',
    description: 'Real-time tracking with carrier updates',
    color: 'from-yellow-500 to-amber-500',
    stats: '98% on-time delivery'
  }
]

interface LoginProps {
  onLogin: (email: string, password: string, role: string) => void
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Check demo accounts
    const account = DEMO_ACCOUNTS.find(
      acc => acc.email === email && acc.password === password
    )

    if (account) {
      toast.success(`Welcome back, ${account.role}!`, {
        icon: '👋',
        duration: 4000
      })
      onLogin(email, password, account.role)
    } else {
      setError('Invalid email or password. Try demo@nova.com / demo123')
      toast.error('Login failed', { icon: '❌' })
    }

    setIsLoading(false)
  }

  // Fill demo credentials
  const fillDemoCredentials = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    toast.success(`Demo credentials filled: ${account.role}`, {
      icon: '🔑',
      duration: 2000
    })
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-electric-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-purple rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -30, 30, -30],
              x: [null, 30, -30, 30],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 z-10">
        {/* Left side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left space-y-8"
        >
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center lg:justify-start space-x-3"
          >
            <div className="w-14 h-14 bg-gradient-to-r from-cosmic-purple to-electric-blue rounded-2xl flex items-center justify-center shadow-2xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-4xl font-bold text-white">NOVA</span>
              <span className="ml-2 px-2 py-1 bg-white/10 rounded-lg text-xs text-white/60">v2.0</span>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            The Future of
            <span className="block bg-gradient-to-r from-cosmic-purple via-electric-blue to-neon-cyan bg-clip-text text-transparent">
              E-Commerce Management
            </span>
          </motion.h1>

          {/* Animated Feature Card */}
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 max-w-md mx-auto lg:mx-0"
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${FEATURES[currentFeature].color} flex items-center justify-center mb-6`}>
              {React.createElement(FEATURES[currentFeature].icon, { className: "w-8 h-8 text-white" })}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {FEATURES[currentFeature].title}
            </h3>
            <p className="text-gray-400 text-lg mb-4">
              {FEATURES[currentFeature].description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Live stats</span>
              <span className="text-lg font-bold text-cosmic-purple">
                {FEATURES[currentFeature].stats}
              </span>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {FEATURES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentFeature(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentFeature
                      ? 'w-8 bg-cosmic-purple'
                      : 'bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-6 justify-center lg:justify-start"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-success-green" />
              <span className="text-sm text-gray-400">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-warning-orange" />
              <span className="text-sm text-gray-400">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-electric-blue" />
              <span className="text-sm text-gray-400">Global CDN</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Login form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 w-full max-w-md"
        >
          <div className="glass-card p-8 relative overflow-hidden">
            {/* Decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cosmic-purple via-electric-blue to-neon-cyan" />

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to access your dashboard</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none transition-colors"
                    placeholder="admin@nova.com"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-dark-border bg-dark-hover text-cosmic-purple focus:ring-cosmic-purple"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.success('Password reset email sent!')}
                  className="text-sm text-cosmic-purple hover:text-electric-blue transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-error-red/10 border border-error-red/20 rounded-xl p-3"
                  >
                    <p className="text-error-red text-sm text-center">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cosmic-purple to-electric-blue text-white rounded-xl py-3 font-medium hover:shadow-lg hover:shadow-cosmic-purple/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark-card text-gray-400">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                {DEMO_ACCOUNTS.map((account, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fillDemoCredentials(account)}
                    className="flex items-center space-x-3 p-3 bg-dark-hover rounded-xl hover:bg-cosmic-purple/20 transition-colors group"
                  >
                    <img
                      src={account.avatar}
                      alt={account.role}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-cosmic-purple/50"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{account.email}</p>
                      <p className="text-xs text-gray-400">
                        {account.role} • {account.store}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-cosmic-purple">
                      {account.password}
                    </div>
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-xs text-gray-500 mt-4">
                Click any demo account to auto-fill credentials
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By continuing, you agree to our{' '}
              <button className="text-cosmic-purple hover:text-electric-blue">Terms</button>
              {' '}and{' '}
              <button className="text-cosmic-purple hover:text-electric-blue">Privacy Policy</button>
            </p>
          </div>

          {/* Mobile feature highlights */}
          <div className="lg:hidden mt-4 grid grid-cols-3 gap-2">
            <div className="glass-card p-3 text-center">
              <Star className="w-5 h-5 text-gold mx-auto mb-1" />
              <span className="text-xs text-gray-400">4.9/5 Rating</span>
            </div>
            <div className="glass-card p-3 text-center">
              <Users className="w-5 h-5 text-cosmic-purple mx-auto mb-1" />
              <span className="text-xs text-gray-400">2k+ Users</span>
            </div>
            <div className="glass-card p-3 text-center">
              <Clock className="w-5 h-5 text-success-green mx-auto mb-1" />
              <span className="text-xs text-gray-400">24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
