import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Package, Plus, Search, Filter, Download, Upload,
  Edit, Trash2, Copy, Eye, Star,
  Grid3x3, List, RefreshCw, X, AlertCircle, Sparkles,
  Camera, FileText, BarChart3, TrendingUp,
  Users, ShoppingBag, Award, Gift, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { isMobile } from 'react-device-detect'
import { format, subDays } from 'date-fns'

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
  freeShipping: boolean
}

interface InventoryInfo {
  trackQuantity: boolean
  allowBackorders: boolean
  lowStockAlert: boolean
  reorderPoint: number
  reorderAmount: number
  supplier: string
  warehouse: string
}

interface SalesInfo {
  totalSold: number
  revenue: number
  views: number
  conversionRate: number
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

// ============= DRAGGABLE PRODUCT CARD =============
interface DragItem {
  id: string
  index: number
}

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

  const [{ isDragging }, drag] = useDrag({
    type: 'product',
    item: { id: product.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop<DragItem, void>({
    accept: 'product',
    hover: (item, monitor) => {
      if (!ref.current) return
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      moveCard(dragIndex, hoverIndex)
      item.index = hoverIndex
    }
  })

  drag(drop(ref))

  const profitColor = product.profit > 0 ? 'text-success-green' : 'text-error-red'
  const stockStatus = product.available < product.lowStockThreshold ? 'error' : 
                     product.available < product.lowStockThreshold * 2 ? 'warning' : 'success'

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-4 cursor-move touch-manipulation"
      onClick={() => onSelect(product)}
    >
      <div className="flex items-start space-x-4">
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

          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-dark-hover text-gray-300 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>

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

          <div className="flex items-center justify-end space-x-2 mt-3">
            <button onClick={(e) => { e.stopPropagation(); onEdit(product); }}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors">
              <Edit className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(product); }}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors">
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(product); }}
              className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
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
  const [suggestions] = useState<string[]>([
    'Wireless noise-canceling headphones with 30-hour battery',
    'Ergonomic gaming mouse with RGB lighting and programmable buttons',
    '4K ultra-wide monitor for professionals with HDR support'
  ])

  const handleGenerate = async () => {
    if (!prompt) return
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    onGenerate({
      name: prompt,
      description: `AI-generated description for ${prompt}.`,
      shortDescription: `Premium ${prompt.toLowerCase()} for discerning customers.`,
      price: Math.floor(Math.random() * 500) + 50,
      cost: Math.floor(Math.random() * 300) + 30,
      tags: ['ai-generated', 'premium', 'new'],
      category: 'Electronics',
      brand: 'NOVA Tech'
    })
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
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the product you want to create..."
          className="w-full h-24 bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white focus:border-cosmic-purple focus:outline-none resize-none"
        />
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button key={i} onClick={() => setPrompt(suggestion)}
                className="px-3 py-1.5 bg-dark-hover text-gray-300 text-sm rounded-full hover:bg-cosmic-purple/20">
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleGenerate} disabled={!prompt || isGenerating}
          className="w-full py-3 rounded-lg bg-cosmic-purple text-white hover:bg-electric-blue disabled:opacity-50 flex items-center justify-center space-x-2">
          {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" /><span>Generating...</span></> :
            <><Sparkles className="w-5 h-5" /><span>Generate Product</span></>}
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

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-card rounded-t-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Bulk Edit</h3>
          <p className="text-sm text-gray-400">{selectedProducts.length} products selected</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-white font-medium">Update Prices</h4>
          <div className="flex items-center space-x-2">
            <select value={priceChangeType} onChange={(e) => setPriceChangeType(e.target.value as 'fixed' | 'percentage')}
              className="bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white">
              <option value="fixed">Fixed amount</option>
              <option value="percentage">Percentage</option>
            </select>
            <input type="number" value={priceChange} onChange={(e) => setPriceChange(parseFloat(e.target.value))}
              className="flex-1 bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white"
              placeholder="Amount" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-medium">Change Category</h4>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white">
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-medium">Update Status</h4>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white">
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6">
        <button onClick={onClose} className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card">
          Cancel
        </button>
        <button onClick={() => { onUpdate({ priceChange, priceChangeType, category: selectedCategory, status: selectedStatus }); onClose(); }}
          className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue">
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="flex items-start justify-between mb-6 sticky top-0 bg-dark-card/50 backdrop-blur-xl p-4 -m-6 mb-0 border-b border-dark-border">
          <div className="flex items-center space-x-4">
            <img src={product.images[0]?.url} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <p className="text-sm text-gray-400">SKU: {product.sku}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Product Name</label>
              <input type="text" value={editedProduct.name} onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white" />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea value={editedProduct.description} onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                rows={4} className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
                <input type="number" value={editedProduct.price} onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Compare at Price</label>
                <input type="number" value={editedProduct.compareAtPrice} onChange={(e) => setEditedProduct({ ...editedProduct, compareAtPrice: parseFloat(e.target.value) })}
                  className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select value={editedProduct.category} onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white">
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home">Home & Garden</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-dark-border">
          <button onClick={onClose} className="px-6 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card">
            Cancel
          </button>
          <button onClick={() => { onSave(editedProduct); onClose(); toast.success('Product updated'); }}
            className="px-6 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue">
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============= MAIN PRODUCTS PAGE =============
const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showBulkEditor, setShowBulkEditor] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => {
      const price = Math.floor(Math.random() * 500) + 50
      const cost = Math.floor(price * 0.5)
      const stock = Math.floor(Math.random() * 100) + 10
      const sold = Math.floor(Math.random() * 200) + 20

      return {
        id: `PROD-${String(i + 1).padStart(3, '0')}`,
        sku: `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        name: ['Wireless Headphones Pro', 'Gaming Mouse X-1000', '4K Monitor 27"'][i % 3],
        description: 'High-quality product with premium features.',
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
        category: ['Electronics', 'Fashion', 'Home'][i % 3],
        subcategory: 'Accessories',
        brand: 'NOVA Tech',
        tags: ['wireless', 'premium'],
        images: [{
          id: `img-${i}`,
          url: `https://picsum.photos/200/200?random=${i}`,
          alt: 'Product image',
          isPrimary: true,
          sortOrder: 0
        }],
        variants: [],
        seo: { title: 'Product SEO', description: 'SEO description', keywords: ['keyword'], slug: 'product-slug' },
        shipping: { weight: 1, weightUnit: 'kg', dimensions: { length: 20, width: 15, height: 10, unit: 'cm' }, freeShipping: false },
        inventory: { trackQuantity: true, allowBackorders: false, lowStockAlert: true, reorderPoint: 10, reorderAmount: 20, supplier: 'NOVA Wholesale', warehouse: 'Main' },
        sales: { totalSold: sold, revenue: sold * price, views: sold * 10, conversionRate: 3.2 },
        reviews: { average: 4.5, total: 50, distribution: { 1: 2, 2: 3, 3: 10, 4: 15, 5: 20 }, recent: [] },
        status: ['active', 'draft', 'archived'][i % 3] as any,
        featured: i % 5 === 0,
        createdAt: subDays(new Date(), i),
        updatedAt: new Date()
      }
    })

    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = [...products]
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus)
    }
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name)
      else if (sortBy === 'price') comparison = a.price - b.price
      else comparison = a.stock - b.stock
      return sortOrder === 'asc' ? comparison : -comparison
    })
    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder])

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    const newProducts = [...filteredProducts]
    const [removed] = newProducts.splice(dragIndex, 1)
    newProducts.splice(hoverIndex, 0, removed)
    setFilteredProducts(newProducts)
    toast.success('Products reordered')
  }, [filteredProducts])

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const categories = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryOptions = Object.entries(categories).map(([name, count]) => ({ name, count }))

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white flex items-center">
              <Package className="w-8 h-8 mr-3 text-cosmic-purple" />
              Products
              <span className="ml-3 px-3 py-1 bg-cosmic-purple/20 text-cosmic-purple text-sm rounded-full">
                {filteredProducts.length} products
              </span>
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 glass-card hover:bg-dark-hover rounded-xl text-white border-none outline-none">
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 glass-card hover:bg-dark-hover rounded-xl">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 glass-card hover:bg-dark-hover rounded-xl">
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search products..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-hover border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-cosmic-purple focus:outline-none" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white min-w-[150px]">
            <option value="all">All Categories</option>
            {categoryOptions.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
            ))}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 glass-card hover:bg-dark-hover rounded-xl text-white min-w-[150px]">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <AIProductGenerator onGenerate={(newProduct) => {
          const product: Product = {
            id: `PROD-${String(products.length + 1).padStart(3, '0')}`,
            sku: `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            ...newProduct as any,
            stock: 100,
            status: 'draft',
            images: [{
              id: 'temp', url: 'https://picsum.photos/200/200?random=999', alt: newProduct.name || 'Product',
              isPrimary: true, sortOrder: 0
            }],
            variants: [],
            sales: { totalSold: 0, revenue: 0, views: 0, conversionRate: 0 },
            reviews: { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, recent: [] },
            createdAt: new Date(), updatedAt: new Date()
          }
          setProducts(prev => [product, ...prev])
        }} />

        {selectedProducts.length > 0 && (
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={toggleSelectAll} className="text-white hover:text-cosmic-purple">
                {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-white">{selectedProducts.length} products selected</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowBulkEditor(true)}
                className="px-4 py-2 bg-cosmic-purple text-white rounded-lg hover:bg-electric-blue flex items-center space-x-2">
                <Edit className="w-4 h-4" /><span>Bulk Edit</span>
              </button>
              <button onClick={() => toast.success(`Exporting ${selectedProducts.length} products`)}
                className="px-4 py-2 bg-dark-hover text-white rounded-lg hover:bg-dark-card flex items-center space-x-2">
                <Download className="w-4 h-4" /><span>Export</span>
              </button>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <DraggableProductCard key={product.id} product={product} index={index} moveCard={moveCard}
                onSelect={() => { setSelectedProduct(product); setShowProductModal(true); }}
                onEdit={(p) => { setSelectedProduct(p); setShowProductModal(true); }}
                onDelete={(p) => { if (window.confirm(`Delete ${p.name}?`)) { setProducts(prev => prev.filter(prod => prod.id !== p.id)); toast.success('Product deleted'); } }}
                onDuplicate={(p) => { const newProduct = { ...p, id: `PROD-${products.length + 1}`, sku: `SKU-${Math.random().toString(36).substring(2, 10)}`, name: `${p.name} (Copy)`, status: 'draft' as const, createdAt: new Date(), updatedAt: new Date() }; setProducts(prev => [newProduct, ...prev]); toast.success('Product duplicated'); }}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-dark-border">
                <th className="py-3 px-4"><input type="checkbox" checked={selectedProducts.length === filteredProducts.length} onChange={toggleSelectAll} className="rounded border-dark-border bg-dark-hover text-cosmic-purple" /></th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Product</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">SKU</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Price</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Stock</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Sold</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Status</th>
                <th className="py-3 px-4 text-left text-sm text-gray-400">Actions</th>
              </tr></thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-dark-border hover:bg-dark-hover/50 cursor-pointer"
                    onClick={() => { setSelectedProduct(product); setShowProductModal(true); }}>
                    <td className="py-3 px-4"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={(e) => { e.stopPropagation(); if (e.target.checked) { setSelectedProducts([...selectedProducts, product.id]) } else { setSelectedProducts(selectedProducts.filter(id => id !== product.id)) } }} className="rounded border-dark-border bg-dark-hover text-cosmic-purple" /></td>
                    <td className="py-3 px-4"><div className="flex items-center space-x-3"><img src={product.images[0]?.url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" /><div><p className="text-white font-medium">{product.name}</p><p className="text-xs text-gray-400">{product.category}</p></div></div></td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{product.sku}</td>
                    <td className="py-3 px-4"><span className="text-white font-bold">${product.price}</span></td>
                    <td className="py-3 px-4"><span className={`text-sm ${product.available < product.lowStockThreshold ? 'text-error-red' : 'text-white'}`}>{product.available}</span></td>
                    <td className="py-3 px-4 text-white">{product.sales.totalSold}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full ${product.status === 'active' ? 'bg-success-green/10 text-success-green' : product.status === 'draft' ? 'bg-gray-500/10 text-gray-400' : 'bg-error-red/10 text-error-red'}`}>{product.status}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowProductModal(true); }} className="p-1 hover:bg-dark-hover rounded"><Edit className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete ${product.name}?`)) { setProducts(prev => prev.filter(p => p.id !== product.id)); toast.success('Product deleted'); } }} className="p-1 hover:bg-dark-hover rounded"><Trash2 className="w-4 h-4 text-gray-400" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AnimatePresence>{showProductModal && selectedProduct && (
          <ProductDetailsModal product={selectedProduct} onClose={() => { setShowProductModal(false); setSelectedProduct(null); }}
            onSave={(updated) => { setProducts(prev => prev.map(p => p.id === updated.id ? updated : p)); }} />
        )}</AnimatePresence>
        <AnimatePresence>{showBulkEditor && (
          <BulkEditor selectedProducts={selectedProducts} onUpdate={(updates) => {
            const updatedProducts = products.map(p => selectedProducts.includes(p.id) ? { ...p, price: updates.priceChange ? (updates.priceChangeType === 'fixed' ? p.price + updates.priceChange : p.price * (1 + updates.priceChange / 100)) : p.price, category: updates.category || p.category, status: updates.status || p.status } : p)
            setProducts(updatedProducts); toast.success(`Updated ${selectedProducts.length} products`)
          }} onClose={() => setShowBulkEditor(false)} />
        )}</AnimatePresence>
      </div>
    </DndProvider>
  )
}

export default Products
