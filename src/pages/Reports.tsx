import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, Calendar, Filter, BarChart3,
  PieChart, TrendingUp, DollarSign,
  ShoppingBag, Users, Package, Clock, Printer,
  Mail, Share2, RefreshCw, Save,
  ChevronDown, ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format, subDays, subMonths } from 'date-fns'
import {
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// ============================================================================
// TYPES
// ============================================================================

interface Report {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  type: 'sales' | 'customers' | 'products' | 'inventory'
  lastGenerated?: Date
  format: 'pdf' | 'csv' | 'excel'
}

interface DateRange {
  start: Date
  end: Date
  label: string
}

// ============================================================================
// REPORTS DATA
// ============================================================================

const REPORTS: Report[] = [
  {
    id: 'sales-summary',
    name: 'Sales Summary',
    description: 'Overview of sales performance with revenue, orders, and AOV',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    type: 'sales',
    lastGenerated: subDays(new Date(), 1),
    format: 'pdf'
  },
  {
    id: 'customer-analysis',
    name: 'Customer Analysis',
    description: 'Customer segments, lifetime value, and acquisition trends',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    type: 'customers',
    lastGenerated: subDays(new Date(), 3),
    format: 'csv'
  },
  {
    id: 'product-performance',
    name: 'Product Performance',
    description: 'Best selling products, revenue by category, and inventory status',
    icon: Package,
    color: 'from-purple-500 to-pink-500',
    type: 'products',
    lastGenerated: subDays(new Date(), 2),
    format: 'excel'
  },
  {
    id: 'inventory-report',
    name: 'Inventory Report',
    description: 'Stock levels, reorder points, and supplier performance',
    icon: Package,
    color: 'from-orange-500 to-red-500',
    type: 'inventory',
    lastGenerated: subDays(new Date(), 4),
    format: 'pdf'
  },
  {
    id: 'monthly-financial',
    name: 'Monthly Financial',
    description: 'Profit & loss, expenses, and revenue breakdown',
    icon: TrendingUp,
    color: 'from-yellow-500 to-amber-500',
    type: 'sales',
    lastGenerated: subDays(new Date(), 5),
    format: 'excel'
  },
  {
    id: 'abandoned-carts',
    name: 'Abandoned Carts',
    description: 'Cart abandonment analysis and recovery opportunities',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-500',
    type: 'sales',
    lastGenerated: subDays(new Date(), 2),
    format: 'csv'
  }
]

// ============================================================================
// CHART DATA
// ============================================================================

const salesData = Array.from({ length: 12 }, (_, i) => ({
  month: format(subMonths(new Date(), 11 - i), 'MMM'),
  revenue: Math.floor(Math.random() * 50000) + 30000
}))

const categoryData = [
  { name: 'Electronics', value: 35, color: '#8B5CF6' },
  { name: 'Fashion', value: 25, color: '#2DD4BF' },
  { name: 'Home', value: 20, color: '#F97316' },
  { name: 'Sports', value: 12, color: '#10B981' },
  { name: 'Beauty', value: 8, color: '#EC4899' }
]

// ============================================================================
// REPORT CARD COMPONENT
// ============================================================================

const ReportCard: React.FC<{
  report: Report
  onGenerate: () => void
  onDownload: () => void
}> = ({ report, onGenerate, onDownload }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass-card p-6 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${report.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color}`}>
            <report.icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              report.format === 'pdf' ? 'bg-error-red/10 text-error-red' :
              report.format === 'csv' ? 'bg-success-green/10 text-success-green' :
              'bg-electric-blue/10 text-electric-blue'
            }`}>
              {report.format.toUpperCase()}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{report.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{report.description}</p>

        {report.lastGenerated && (
          <p className="text-xs text-gray-500 mb-4">
            Last generated {format(report.lastGenerated, 'MMM dd, yyyy')}
          </p>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={onGenerate}
            className="flex-1 px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors text-sm flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate</span>
          </button>
          <button
            onClick={onDownload}
            className="p-2 bg-dark-hover text-gray-400 hover:text-white rounded-lg hover:bg-dark-card transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// DATE RANGE PICKER
// ============================================================================

const DateRangePicker: React.FC<{
  value: DateRange
  onChange: (range: DateRange) => void
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 glass-card hover:bg-dark-hover rounded-xl"
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-white">{value.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 glass-card rounded-xl p-2 z-10 min-w-[200px]">
          {ranges.map((range) => (
            <button
              key={range.label}
              onClick={() => {
                const end = new Date()
                const start = range.days === 0 ? new Date() : subDays(end, range.days as number)
                onChange({
                  start,
                  end,
                  label: range.label
                })
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-hover rounded-lg transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// REPORTS PAGE COMPONENT
// ============================================================================

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 days'
  })
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  const filteredReports = selectedType === 'all'
    ? REPORTS
    : REPORTS.filter(r => r.type === selectedType)

  const handleGenerateReport = (report: Report) => {
    toast.success(`Generating ${report.name}...`, {
      icon: '📊',
      duration: 3000
    })
    setTimeout(() => {
      toast.success(`${report.name} generated successfully!`, {
        icon: '✅'
      })
    }, 2000)
  }

  const handleDownload = (report: Report) => {
    toast.success(`Downloading ${report.name}...`, {
      icon: '📥'
    })
  }

  const handleExportAll = async () => {
    setIsExporting(true)
    toast.success('Preparing your reports...', {
      icon: '📦',
      duration: 2000
    })
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsExporting(false)
    toast.success('All reports exported successfully!', {
      icon: '🎉'
    })
  }

  const handleEmailReport = () => {
    toast.success('Report scheduled for email delivery')
  }

  const handleScheduleReport = () => {
    toast.success('Report schedule configured')
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
            <FileText className="w-8 h-8 mr-3 text-cosmic-purple" />
            Reports
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Generate and download business reports
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none"
          >
            <option value="all">All Reports</option>
            <option value="sales">Sales Reports</option>
            <option value="customers">Customer Reports</option>
            <option value="products">Product Reports</option>
            <option value="inventory">Inventory Reports</option>
          </select>

          <button
            onClick={handleExportAll}
            disabled={isExporting}
            className="px-4 py-2 bg-cosmic-purple text-white rounded-xl hover:bg-electric-blue transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Revenue Trend</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
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
              <XAxis dataKey="month" stroke="#666" />
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

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Revenue by Category</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onGenerate={() => handleGenerateReport(report)}
            onDownload={() => handleDownload(report)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <button
          onClick={handleEmailReport}
          className="glass-card p-4 hover:scale-105 transition-all flex items-center space-x-4"
        >
          <div className="p-3 bg-cosmic-purple/20 rounded-xl">
            <Mail className="w-6 h-6 text-cosmic-purple" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-white font-medium">Email Reports</h3>
            <p className="text-xs text-gray-400 mt-1">Send reports to your inbox</p>
          </div>
        </button>

        <button
          onClick={handleScheduleReport}
          className="glass-card p-4 hover:scale-105 transition-all flex items-center space-x-4"
        >
          <div className="p-3 bg-cosmic-purple/20 rounded-xl">
            <Clock className="w-6 h-6 text-cosmic-purple" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-white font-medium">Schedule Reports</h3>
            <p className="text-xs text-gray-400 mt-1">Set up automatic reports</p>
          </div>
        </button>

        <button
          onClick={() => toast.success('Custom report builder opened')}
          className="glass-card p-4 hover:scale-105 transition-all flex items-center space-x-4"
        >
          <div className="p-3 bg-cosmic-purple/20 rounded-xl">
            <BarChart3 className="w-6 h-6 text-cosmic-purple" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-white font-medium">Custom Report</h3>
            <p className="text-xs text-gray-400 mt-1">Build your own report</p>
          </div>
        </button>
      </div>
    </div>
  )
}

export default Reports
