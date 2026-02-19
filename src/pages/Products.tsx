import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Package, Plus, Search, Filter, Download, Upload,
  Edit, Trash2, Copy, Eye, MoreVertical, Star,
  Tag, DollarSign, Grid3x3, List, SlidersHorizontal,
  RefreshCw, X, Check, AlertCircle, Sparkles,
  Camera, Video, FileText, BarChart3, TrendingUp,
  TrendingDown, Archive, Share2, Printer, Mail,
  Facebook, Twitter, Instagram, Link, QrCode,
  Scan, Barcode, PackageCheck, PackageX, Clock,
  Users, ShoppingBag, Award, Gift, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useSwipeable } from 'react-swipeable'
import { useLongPress } from 'use-long-press'
import CountUp from 'react-countup'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { QRCodeSVG } from 'qrcode.react'
import { Line } from 'rc-progress'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

// ============= TYPES =============
interface Product {
  id: string
  sku: string
  name: string
  description: string
  shortDescription: string
  price: number
  cost: number
  compareAtPrice: number
  profit: number
  margin: number
  stock: number
  reserved: number
  available: number
  lowStockThreshold: number
  category: string
  subcategory: string
  brand: string
  tags: string[]
  images: ProductImage[]
  videos?: ProductVideo[]
  variants: ProductVariant[]
  seo: SEOData
  shipping: ShippingInfo
  inventory: InventoryInfo
  sales: SalesInfo
  reviews: ReviewInfo
  status: 'active' | 'draft' | 'archived'
  featured: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  sortOrder: number
  color?: string
}

interface ProductVideo {
  id: string
  url: string
  thumbnail: string
  title: string
}

interface ProductVariant {
  id: string
  sku: string
  name: string
  options: VariantOption[]
  price: number
  cost: number
  stock: number
  images: string[]
  isActive: boolean
}

interface VariantOption {
  name: string
  value: string
}

interface SEOData {
  title: string
  description: string
  keywords: string[]
  slug: string
  canonical?: string
}

interface ShippingInfo {
  weight: number
  weightUnit: 'kg' | 'lb' | 'g'
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  flatRate?: number
  freeShipping: boolean
}

interface InventoryInfo {
  trackQuantity: boolean
  allowBackorders: boolean
  lowStockAlert: boolean
  reorderPoint: number
  reorderAmount: number
  supplier: string
  supplierSku?: string
  warehouse: string
  binLocation?: string
}

interface SalesInfo {
  totalSold: number
  revenue: number
  views: number
  conversionRate: number
  lastSold?: Date
  dailySales: { date: string; quantity: number }[]
  monthlySales: { month: string; quantity: number }[]
}

interface ReviewInfo {
  average: number
  total: number
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number }
  recent: Review[]
}

interface Review {
  id: string
  author: string
  rating: number
  title: string
  content: string
  date: Date
  verified: boolean
  helpful: number
  images?: string[]
}

interface Category {
  id: string
  name: string
  slug: string
  parent?: string
  children?: Category[]
  productCount: number
  image?: string
}

// ============= 3D PRODUCT VIEWER =============
const ProductViewer3D: React.FC<{
  images: ProductImage[]
  onRotate?: (angle: number) => void
  onZoom?: (level: number) => void
}> = ({ images, onRotate, onZoom }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRotating, setIsRotating] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const viewerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsRotating(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isRotating) return
    const currentX = e.touches[0].clientX
    const diff = (currentX - startX.current) / 5
    setRotation(prev => {
      const newRotation = prev + diff
      onRotate?.(newRotation)
      return newRotation
    })
    startX.current = currentX
  }

  const handleTouchEnd = () => {
    setIsRotating(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY / 1000))
    setZoom(newZoom)
    onZoom?.(newZoom)
  }

  return (
    <motion.div
      ref={viewerRef}
      className="relative w-full h-96 bg-dark-card rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* 3D rotation container */}
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: rotation }}
        transition={{ type: 'spring', damping: 30 }}
      >
        <motion.img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.alt}
          className="w-full h-full object-contain"
          style={{ scale: zoom }}
        />
      </motion.div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 glass-card px-3 py-2 rounded-full">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-cosmic-purple' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 glass-card px-3 py-1 rounded-full text-xs text-white">
        {Math.round(zoom * 100)}%
      </div>

      {/* Rotation hint */}
      <motion.div
        animate={{ opacity: isRotating ? 0 : 1 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm glass-card px-4 py-2 rounded-full pointer-events-none"
      >
        Drag to rotate 360°
      </motion.div>
    </motion.div>
  )
}

// ============= DRAGGABLE PRODUCT CARD =============
const DraggableProductCard: React.FC<{
  product: Product
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  onSelect: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onDuplicate: (product: Product) => void
}> = ({ product, index, moveCard, onSelect, onEdit, onDelete, onDuplicate }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [{ handlerId }, drop] = useDrop({
    accept: 'product',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      }
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  const [{ isDragging: dragPreview }, drag] = useDrag({
    type: 'product',
    item: () => ({ id: product.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: () => setIsDragging(false)
  })

  drag(drop(ref))

  // Gesture handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      toast.success(`Archiving ${product.name}`)
    },
    onSwipedRight: () => {
      toast.success(`Duplicating ${product.name}`)
      onDuplicate(product)
    },
    trackMouse: true
  })

  const longPress = useLongPress(() => {
    toast.success(`Quick actions for ${product.name}`)
  })

  const profitColor = product.profit > 0 ? 'text-success-green' : 'text-error-red'
  const stockStatus = product.available < product.lowStockThreshold ? 'error' : product.available < product.lowStockThreshold * 2 ? 'warning' : 'success'

  return (
    <motion.div
      ref={ref}
      {...handlers}
      {...longPress}
      data-handler-id={handlerId}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 20px 25px -5px rgba(0,0,0,0.5)' : 'none'
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-4 cursor-move touch-manipulation"
      onClick={() => onSelect(product)}
    >
      <div className="flex items-start space-x-4">
        {/* Product image */}
        <div className="relative">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          {product.featured && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-white font-medium truncate">{product.name}</h3>
              <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                product.status === 'active' ? 'bg-success-green/10 text-success-green' :
                product.status === 'draft' ? 'bg-gray-500/10 text-gray-400' :
                'bg-error-red/10 text-error-red'
              }`}>
                {product.status}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-dark-hover text-gray-300 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div>
              <p className="text-xs text-gray-400">Price</p>
              <p className="text-sm text-white font-bold">${product.price}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Stock</p>
              <p className={`text-sm font-medium ${
                stockStatus === 'error' ? 'text-error-red' :
                stockStatus === 'warning' ? 'text-warning-orange' :
                'text-success-green'
              }`}>{product.available}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Sold</p>
              <p className="text-sm text-white">{product.sales.totalSold}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Profit</p>
              <p className={`text-sm font-bold ${profitColor}`}>
                ${product.profit}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Stock level</span>
              <span className={stockStatus === 'error' ? 'text-error-red' : 'text-white'}>
                {Math.round((product.available / product.stock) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-dark-card rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  stockStatus === 'error' ? 'bg-error-red' :
                  stockStatus === 'warning' ? 'bg-warning-orange' :
                  'bg-success-green'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${(product.available / product.stock) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center justify-end space-x-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(product)
              }}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate(product)
              }}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(product)
              }}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Drag handle indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <div className="w-1 h-8 bg-gray-600 rounded-full" />
      </div>
    </motion.div>
  )
}

// ============= AI PRODUCT GENERATOR =============
const AIProductGenerator: React.FC<{
  onGenerate: (product: Partial<Product>) => void
}> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([
    'Wireless noise-canceling headphones with 30-hour battery',
    'Ergonomic gaming mouse with RGB lighting and programmable buttons',
    '4K ultra-wide monitor for professionals with HDR support',
    'Mechanical keyboard with hot-swappable switches'
  ])

  const handleGenerate = async () => {
    if (!prompt) return

    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const generatedProduct: Partial<Product> = {
      name: prompt,
      description: `AI-generated description for ${prompt}. This product is designed to meet the highest standards of quality and performance.`,
      shortDescription: `Premium ${prompt.toLowerCase()} for discerning customers.`,
      price: Math.floor(Math.random() * 500) + 50,
      cost: Math.floor(Math.random() * 300) + 30,
      tags: ['ai-generated', 'premium', 'new'],
      category: 'Electronics',
      brand: 'NOVA Tech'
    }

    onGenerate(generatedProduct)
    setIsGenerating(false)
    setPrompt('')
    toast.success('Product generated by AI!', { icon: '🤖' })
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-cosmic-purple" />
        <h3 className="text-white font-medium">AI Product Generator</h3>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the product you want to create..."
          className="w-full h-24 bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-cosmic-purple focus:outline-none resize-none"
        />

        {/* Suggestions */}
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setPrompt(suggestion)}
                className="px-3 py-1.5 bg-dark-hover text-gray-300 text-sm rounded-full hover:bg-cosmic-purple/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
            isGenerating
              ? 'bg-cosmic-purple/50 cursor-not-allowed'
              : 'bg-cosmic-purple hover:bg-electric-blue'
          } text-white transition-colors`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Product</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============= BULK EDITOR =============
const BulkEditor: React.FC<{
  selectedProducts: string[]
  onUpdate: (updates: any) => void
  onClose: () => void
}> = ({ selectedProducts, onUpdate, onClose }) => {
  const [priceChange, setPriceChange] = useState(0)
  const [priceChangeType, setPriceChangeType] = useState<'fixed' | 'percentage'>('fixed')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [tags, setTags] = useState<string[]>([])

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-3xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Bulk Edit</h3>
          <p className="text-sm text-gray-400">{selectedProducts.length} products selected</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price updates */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Update Prices</h4>
          <div className="flex items-center space-x-2">
            <select
              value={priceChangeType}
              onChange={(e) => setPriceChangeType(e.target.value as any)}
              className="bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
            >
              <option value="fixed">Fixed amount</option>
              <option value="percentage">Percentage</option>
            </select>
            <input
              type="number"
              value={priceChange}
              onChange={(e) => setPriceChange(parseFloat(e.target.value))}
              className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
              placeholder="Amount"
            />
          </div>
        </div>

        {/* Category update */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Change Category</h4>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
          >
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>

        {/* Status update */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Update Status</h4>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Add Tags</h4>
          <input
            type="text"
            placeholder="Enter tags (comma separated)"
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onUpdate({
              priceChange,
              priceChangeType,
              category: selectedCategory,
              status: selectedStatus,
              tags
            })
            onClose()
            toast.success(`Updated ${selectedProducts.length} products`)
          }}
          className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </motion.div>
  )
}

// ============= PRODUCT DETAILS MODAL =============
const ProductDetailsModal: React.FC<{
  product: Product
  onClose: () => void
  onSave: (updated: Product) => void
}> = ({ product, onClose, onSave }) => {
  const [editedProduct, setEditedProduct] = useState(product)
  const [activeTab, setActiveTab] = useState<'details' | 'variants' | 'inventory' | 'seo' | 'reviews'>('details')

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
        className="relative glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-dark-card/50 backdrop-blur-xl p-4 -m-6 mb-0 border-b border-dark-border">
          <div className="flex items-center space-x-4">
            <img
              src={product.images[0]?.url}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <p className="text-sm text-gray-400">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-dark-border">
          {[
            { id: 'details', label: 'Details', icon: FileText },
            { id: 'variants', label: 'Variants', icon: Package },
            { id: 'inventory', label: 'Inventory', icon: BarChart3 },
            { id: 'seo', label: 'SEO', icon: TrendingUp },
            { id: 'reviews', label: 'Reviews', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cosmic-purple text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editedProduct.name}
                  onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  value={editedProduct.description}
                  onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                  rows={4}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={editedProduct.price}
                    onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Compare at Price</label>
                  <input
                    type="number"
                    value={editedProduct.compareAtPrice}
                    onChange={(e) => setEditedProduct({ ...editedProduct, compareAtPrice: parseFloat(e.target.value) })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={editedProduct.category}
                  onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Garden</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags</label>
                <input
                  type="text"
                  value={editedProduct.tags.join(', ')}
                  onChange={(e) => setEditedProduct({ ...editedProduct, tags: e.target.value.split(',').map(t => t.trim()) })}
                  placeholder="Separate with commas"
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              {editedProduct.variants.map((variant, index) => (
                <div key={variant.id} className="p-4 bg-dark-hover rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{variant.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      variant.isActive ? 'bg-success-green/10 text-success-green' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">SKU</p>
                      <p className="text-white">{variant.sku}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-white">${variant.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Stock</p>
                      <p className="text-white">{variant.stock}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed border-dark-border rounded-lg text-gray-400 hover:text-white hover:border-cosmic-purple transition-colors">
                + Add Variant
              </button>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Stock</label>
                  <input
                    type="number"
                    value={editedProduct.stock}
                    onChange={(e) => setEditedProduct({ ...editedProduct, stock: parseInt(e.target.value) })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={editedProduct.lowStockThreshold}
                    onChange={(e) => setEditedProduct({ ...editedProduct, lowStockThreshold: parseInt(e.target.value) })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Supplier</label>
                <input
                  type="text"
                  value={editedProduct.inventory.supplier}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    inventory: { ...editedProduct.inventory, supplier: e.target.value }
                  })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reorder Point</label>
                  <input
                    type="number"
                    value={editedProduct.inventory.reorderPoint}
                    onChange={(e) => setEditedProduct({
                      ...editedProduct,
                      inventory: { ...editedProduct.inventory, reorderPoint: parseInt(e.target.value) }
                    })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reorder Amount</label>
                  <input
                    type="number"
                    value={editedProduct.inventory.reorderAmount}
                    onChange={(e) => setEditedProduct({
                      ...editedProduct,
                      inventory: { ...editedProduct.inventory, reorderAmount: parseInt(e.target.value) }
                    })}
                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
                <input
                  type="text"
                  value={editedProduct.seo.title}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    seo: { ...editedProduct.seo, title: e.target.value }
                  })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
                <textarea
                  value={editedProduct.seo.description}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    seo: { ...editedProduct.seo, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Keywords</label>
                <input
                  type="text"
                  value={editedProduct.seo.keywords.join(', ')}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    seo: { ...editedProduct.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
                  })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">URL Slug</label>
                <input
                  type="text"
                  value={editedProduct.seo.slug}
                  onChange={(e) => setEditedProduct({
                    ...editedProduct,
                    seo: { ...editedProduct.seo, slug: e.target.value }
                  })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white"
                />
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-dark-hover rounded-lg">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{product.reviews.average}</p>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(product.reviews.average)
                            ? 'text-gold fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{product.reviews.total} reviews</p>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 w-8">{rating}★</span>
                      <div className="flex-1 h-2 bg-dark-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold"
                          style={{
                            width: `${(product.reviews.distribution[rating as keyof typeof product.reviews.distribution] / product.reviews.total) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8">
                        {product.reviews.distribution[rating as keyof typeof product.reviews.distribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent reviews */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Recent Reviews</h4>
                {product.reviews.recent.map((review) => (
                  <div key={review.id} className="p-4 bg-dark-hover rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{review.author}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? 'text-gold fill-current'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDistance(review.date, new Date(), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {review.verified && (
                        <span className="text-xs bg-success-green/10 text-success-green px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <h5 className="text-white text-sm mt-3">{review.title}</h5>
                    <p className="text-gray-400 text-sm mt-1">{review.content}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mt-3">
                        {review.images.map((image, i) => (
                          <img
                            key={i}
                            src={image}
                            alt={`Review ${i + 1}`}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      <button className="text-xs text-gray-400 hover:text-white">
                        Helpful ({review.helpful})
                      </button>
                      <button className="text-xs text-gray-400 hover:text-white">
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-dark-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(editedProduct)
              onClose()
              toast.success('Product updated successfully')
            }}
            className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= MAIN PRODUCTS PAGE =============
const Products: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showBulkEditor, setShowBulkEditor] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'sold'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)

  // Generate mock products
  useEffect(() => {
    const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => {
      const price = Math.floor(Math.random() * 500) + 50
      const cost = Math.floor(price * (0.4 + Math.random() * 0.3))
      const stock = Math.floor(Math.random() * 100) + 10
      const sold = Math.floor(Math.random() * 200) + 20
      const rating = 3 + Math.random() * 2
      const reviews = Math.floor(Math.random() * 50) + 5

      return {
        id: `PROD-${String(i + 1).padStart(3, '0')}`,
        sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        name: [
          'Wireless Headphones Pro',
          'Gaming Mouse X-1000',
          '4K Ultra HD Monitor 27"',
          'Mechanical Keyboard RGB',
          'USB-C Hub 7-in-1',
          'Phone Case Premium',
          'Screen Protector Glass',
          'Power Bank 20000mAh',
          'Smart Watch Series 5',
          'Bluetooth Speaker',
          'Laptop Stand Aluminum',
          'Webcam 4K Pro',
          'Microphone USB',
          'Streaming Light Kit',
          'Desk Mat Large'
        ][i % 15],
        description: 'High-quality product with premium features and excellent build quality.',
        shortDescription: 'Premium quality product',
        price,
        cost,
        compareAtPrice: price * 1.2,
        profit: price - cost,
        margin: ((price - cost) / price) * 100,
        stock,
        reserved: Math.floor(Math.random() * 5),
        available: stock - Math.floor(Math.random() * 5),
        lowStockThreshold: 10,
        category: ['Electronics', 'Fashion', 'Home', 'Sports'][Math.floor(Math.random() * 4)],
        subcategory: 'Accessories',
        brand: ['NOVA Tech', 'SoundMaster', 'VisionPlus', 'GameX'][Math.floor(Math.random() * 4)],
        tags: ['wireless', 'premium', 'new', 'bestseller'].slice(0, Math.floor(Math.random() * 3) + 1),
        images: [
          {
            id: `img-${i}`,
            url: `https://images.unsplash.com/photo-${[
              '1505740420928-5e560c06d30e',
              '1523275335684-37898b6baf30',
              '1504274066586-511b5b5c6b3b',
              '1526170375885-61d8b1e3a4d0'
            ][Math.floor(Math.random() * 4)]}?w=400&h=400&fit=crop`,
            alt: 'Product image',
            isPrimary: true,
            sortOrder: 0
          }
        ],
        videos: [],
        variants: [],
        seo: {
          title: 'Product SEO Title',
          description: 'Product SEO description',
          keywords: ['keyword1', 'keyword2'],
          slug: 'product-slug'
        },
        shipping: {
          weight: Math.floor(Math.random() * 5) + 1,
          weightUnit: 'kg',
          dimensions: {
            length: 20,
            width: 15,
            height: 10,
            unit: 'cm'
          },
          freeShipping: Math.random() > 0.7
        },
        inventory: {
          trackQuantity: true,
          allowBackorders: false,
          lowStockAlert: true,
          reorderPoint: 10,
          reorderAmount: 20,
          supplier: 'NOVA Wholesale',
          warehouse: 'Main Warehouse',
          binLocation: `A-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10)}`
        },
        sales: {
          totalSold: sold,
          revenue: sold * price,
          views: sold * (10 + Math.random() * 20),
          conversionRate: (sold / (sold * 15)) * 100,
          dailySales: [],
          monthlySales: []
        },
        reviews: {
          average: rating,
          total: reviews,
          distribution: {
            1: Math.floor(reviews * 0.05),
            2: Math.floor(reviews * 0.1),
            3: Math.floor(reviews * 0.2),
            4: Math.floor(reviews * 0.3),
            5: Math.floor(reviews * 0.35)
          },
          recent: Array.from({ length: 3 }, (_, j) => ({
            id: `rev-${i}-${j}`,
            author: ['John D.', 'Sarah M.', 'Mike R.'][j],
            rating: Math.floor(Math.random() * 2) + 4,
            title: 'Great product!',
            content: 'Really happy with this purchase. Quality is excellent.',
            date: subDays(new Date(), Math.floor(Math.random() * 30)),
            verified: true,
            helpful: Math.floor(Math.random() * 10)
          }))
        },
        status: ['active', 'draft', 'archived'][Math.floor(Math.random() * 3)] as any,
        featured: Math.random() > 0.8,
        createdAt: subDays(new Date(), Math.floor(Math.random() * 100)),
        updatedAt: new Date()
      }
    })

    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
    setIsLoading(false)
  }, [])

  // Filter products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stock - b.stock
          break
        case 'sold':
          comparison = a.sales.totalSold - b.sales.totalSold
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder])

  // Drag and drop reorder
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    const newProducts = [...filteredProducts]
    const [removed] = newProducts.splice(dragIndex, 1)
    newProducts.splice(hoverIndex, 0, removed)
    setFilteredProducts(newProducts)
    toast.success('Products reordered')
  }, [filteredProducts])

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  // Bulk actions
  const handleBulkUpdate = (updates: any) => {
    const updatedProducts = products.map(p => {
      if (selectedProducts.includes(p.id)) {
        let newPrice = p.price

        // Apply price changes
        if (updates.priceChange) {
          if (updates.priceChangeType === 'fixed') {
            newPrice += updates.priceChange
          } else {
            newPrice *= (1 + updates.priceChange / 100)
          }
        }

        return {
          ...p,
          price: newPrice,
          category: updates.category || p.category,
          status: updates.status || p.status,
          tags: updates.tags.length ? [...new Set([...p.tags, ...updates.tags])] : p.tags
        }
      }
      return p
    })

    setProducts(updatedProducts)
    toast.success(`Updated ${selectedProducts.length} products`)
  }

  // Categories with counts
  const categories = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    }))
  }, [products])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmic-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
              <Package className="w-8 h-8 mr-3 text-cosmic-purple" />
              Products
              <span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">
                {filteredProducts.length} products
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your product catalog with AI-powered tools
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <button
              onClick={() => {
                setSelectedProduct(null)
                setShowProductModal(true)
              }}
              className="px-4 py-2 bg-cosmic-purple/20 text-cosmic-purple rounded-xl hover:bg-cosmic-purple/30 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="sold">Sort by Sold</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 glass-card hover:bg-dark-hover rounded-xl"
            >
              {sortOrder === 'asc' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 glass-card hover:bg-dark-hover rounded-xl"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-cosmic-purple focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none min-w-[150px]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* AI Product Generator */}
        <AIProductGenerator
          onGenerate={(newProduct) => {
            const product: Product = {
              id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
              sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
              ...newProduct as any,
              stock: 100,
              sold: 0,
              status: 'draft',
              images: [{
                id: 'temp',
                url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
                alt: newProduct.name || 'Product',
                isPrimary: true,
                sortOrder: 0
              }],
              variants: [],
              sales: { totalSold: 0, revenue: 0, views: 0, conversionRate: 0, dailySales: [], monthlySales: [] },
              reviews: { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, recent: [] },
              createdAt: new Date(),
              updatedAt: new Date()
            }
            setProducts(prev => [product, ...prev])
          }}
        />

        {/* Selection bar */}
        {selectedProducts.length > 0 && (
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSelectAll}
                className="text-white hover:text-cosmic-purple transition-colors"
              >
                {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-white">{selectedProducts.length} products selected</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBulkEditor(true)}
                className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Bulk Edit</span>
              </button>
              <button
                onClick={() => {
                  toast.success(`Exporting ${selectedProducts.length} products`)
                }}
                className="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        )}

        {/* Products grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <DraggableProductCard
                key={product.id}
                product={product}
                index={index}
                moveCard={moveCard}
                onSelect={() => {
                  setSelectedProduct(product)
                  setShowProductModal(true)
                }}
                onEdit={(p) => {
                  setSelectedProduct(p)
                  setShowProductModal(true)
                }}
                onDelete={(p) => {
                  if (window.confirm(`Delete ${p.name}?`)) {
                    setProducts(prev => prev.filter(prod => prod.id !== p.id))
                    toast.success('Product deleted')
                  }
                }}
                onDuplicate={(p) => {
                  const newProduct = {
                    ...p,
                    id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
                    sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                    name: `${p.name} (Copy)`,
                    status: 'draft' as const,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                  setProducts(prev => [newProduct, ...prev])
                  toast.success('Product duplicated')
                }}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Sold</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-dark-border hover:bg-dark-hover/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product)
                      setShowProductModal(true)
                    }}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                        className="rounded border-dark-border bg-dark-hover text-cosmic-purple"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images[0]?.url}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300 text-sm">{product.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-bold">${product.price}</span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-xs text-gray-500 line-through ml-2">
                          ${product.compareAtPrice}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          product.available < product.lowStockThreshold
                            ? 'text-error-red'
                            : 'text-white'
                        }`}>
                          {product.available}
                        </span>
                        <div className="w-16 h-1.5 bg-dark-card rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              product.available < product.lowStockThreshold
                                ? 'bg-error-red'
                                : product.available < product.lowStockThreshold * 2
                                ? 'bg-warning-orange'
                                : 'bg-success-green'
                            }`}
                            style={{ width: `${(product.available / product.stock) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white">{product.sales.totalSold}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'active'
                          ? 'bg-success-green/10 text-success-green'
                          : product.status === 'draft'
                          ? 'bg-gray-500/10 text-gray-400'
                          : 'bg-error-red/10 text-error-red'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProduct(product)
                            setShowProductModal(true)
                          }}
                          className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const newProduct = {
                              ...product,
                              id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
                              sku: `SKU-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
                              name: `${product.name} (Copy)`,
                              status: 'draft' as const
                            }
                            setProducts(prev => [newProduct, ...prev])
                            toast.success('Product duplicated')
                          }}
                          className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`Delete ${product.name}?`)) {
                              setProducts(prev => prev.filter(p => p.id !== product.id))
                              toast.success('Product deleted')
                            }
                          }}
                          className="p-1 hover:bg-dark-hover rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Product Details Modal */}
        <AnimatePresence>
          {showProductModal && selectedProduct && (
            <ProductDetailsModal
              product={selectedProduct}
              onClose={() => {
                setShowProductModal(false)
                setSelectedProduct(null)
              }}
              onSave={(updated) => {
                setProducts(prev =>
                  prev.map(p => p.id === updated.id ? updated : p)
                )
              }}
            />
          )}
        </AnimatePresence>

        {/* Bulk Editor Modal */}
        <AnimatePresence>
          {showBulkEditor && (
            <BulkEditor
              selectedProducts={selectedProducts}
              onUpdate={handleBulkUpdate}
              onClose={() => setShowBulkEditor(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default Products
