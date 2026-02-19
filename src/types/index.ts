// ============================================================================
// CORE TYPES
// ============================================================================

export type ID = string
export type DateTime = Date
export type Email = string
export type Phone = string
export type URL = string
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD'
export type WeightUnit = 'kg' | 'lb' | 'g' | 'oz'
export type DimensionUnit = 'cm' | 'in' | 'm' | 'ft'
export type Status = 'active' | 'inactive' | 'draft' | 'archived' | 'deleted'
export type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent'
export type Theme = 'dark' | 'light' | 'system'
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ar' | 'ru'
export type Timezone = string

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer' | 'support'

export interface User {
  id: ID
  email: Email
  firstName: string
  lastName: string
  fullName: string
  avatar?: URL
  role: UserRole
  permissions: Permission[]
  stores: Store['id'][]
  preferences: UserPreferences
  twoFactorEnabled: boolean
  lastLoginAt?: DateTime
  lastActiveAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  status: 'active' | 'inactive' | 'suspended'
  metadata?: Record<string, any>
}

export interface UserPreferences {
  theme: Theme
  language: Language
  timezone: Timezone
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: Currency
  notifications: NotificationPreferences
  accessibility: AccessibilityPreferences
  dashboard: DashboardPreferences
  privacy: PrivacyPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  orderAlerts: boolean
  inventoryAlerts: boolean
  marketingAlerts: boolean
  systemAlerts: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface AccessibilityPreferences {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'x-large'
  screenReader: boolean
  keyboardNavigation: boolean
}

export interface DashboardPreferences {
  defaultView: 'analytics' | 'orders' | 'products' | 'customers'
  widgets: string[]
  layout: DashboardLayout
  refreshInterval: number
}

export interface PrivacyPreferences {
  shareData: boolean
  analytics: boolean
  marketingCookies: boolean
  functionalCookies: boolean
}

export interface Permission {
  id: ID
  name: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  conditions?: Record<string, any>
}

export interface Session {
  id: ID
  userId: ID
  token: string
  refreshToken: string
  expiresAt: DateTime
  createdAt: DateTime
  lastActivityAt: DateTime
  ipAddress: string
  userAgent: string
  device: Device
  location: GeoLocation
}

// ============================================================================
// STORE & MULTI-TENANCY
// ============================================================================

export interface Store {
  id: ID
  name: string
  slug: string
  domain?: string
  logo?: URL
  favicon?: URL
  brandColor?: string
  email: Email
  phone?: Phone
  address?: Address
  currency: Currency
  timezone: Timezone
  language: Language
  status: 'active' | 'maintenance' | 'inactive'
  settings: StoreSettings
  features: StoreFeatures
  stats: StoreStats
  createdAt: DateTime
  updatedAt: DateTime
}

export interface StoreSettings {
  tax: TaxSettings
  shipping: ShippingSettings
  payments: PaymentSettings
  checkout: CheckoutSettings
  email: EmailSettings
  security: SecuritySettings
  integrations: IntegrationSettings
}

export interface TaxSettings {
  rates: TaxRate[]
  autoCalculate: boolean
  taxIncluded: boolean
  taxJarEnabled: boolean
  nexusAddresses: Address[]
}

export interface TaxRate {
  id: ID
  name: string
  rate: number
  country: string
  state?: string
  city?: string
  postalCode?: string
  priority: number
  compound: boolean
  shipping: boolean
}

export interface ShippingSettings {
  origin: Address
  methods: ShippingMethod[]
  zones: ShippingZone[]
  packages: ShippingPackage[]
  carriers: ShippingCarrier[]
  autoRate: boolean
  freeShippingThreshold?: number
}

export interface ShippingMethod {
  id: ID
  name: string
  code: string
  carrier: string
  service: string
  rate: number
  currency: Currency
  zones: string[]
  minWeight?: number
  maxWeight?: number
  minPrice?: number
  maxPrice?: number
  estimatedDays: [number, number]
}

export interface ShippingZone {
  id: ID
  name: string
  countries: string[]
  states?: string[]
  postalCodes?: string[]
  methods: string[]
}

export interface PaymentSettings {
  gateways: PaymentGateway[]
  currency: Currency
  acceptedCards: string[]
  testMode: boolean
  autoCapture: boolean
  refundPolicy?: string
}

export interface PaymentGateway {
  id: ID
  name: string
  provider: 'stripe' | 'paypal' | 'square' | 'authorize' | 'braintree' | 'custom'
  enabled: boolean
  testMode: boolean
  config: Record<string, any>
  fees: {
    percentage: number
    fixed: number
  }
}

export interface CheckoutSettings {
  guestCheckout: boolean
  accountCreation: boolean
  termsUrl?: URL
  privacyUrl?: URL
  abandonedCart: AbandonedCartSettings
}

export interface AbandonedCartSettings {
  enabled: boolean
  delay: number
  emailTemplate: string
  smsTemplate?: string
  discount?: number
}

export interface EmailSettings {
  fromEmail: Email
  fromName: string
  logo?: URL
  footer?: string
  templates: EmailTemplate[]
  smtp?: SMTPConfig
}

export interface EmailTemplate {
  id: ID
  name: string
  subject: string
  body: string
  variables: string[]
  event: string
}

export interface SecuritySettings {
  requireLogin: boolean
  twoFactorAuth: boolean
  sessionTimeout: number
  ipWhitelist?: string[]
  rateLimiting: RateLimit[]
  firewall: FirewallRules
}

export interface StoreFeatures {
  multiCurrency: boolean
  multiLanguage: boolean
  subscriptions: boolean
  giftCards: boolean
  wishlists: boolean
  reviews: boolean
  backorders: boolean
  preOrders: boolean
  digitalProducts: boolean
  downloadableProducts: boolean
  customizableProducts: boolean
}

export interface StoreStats {
  products: number
  orders: number
  customers: number
  revenue: number
  conversionRate: number
  avgOrderValue: number
}

// ============================================================================
// PRODUCTS
// ============================================================================

export interface Product {
  id: ID
  storeId: ID
  sku: string
  barcode?: string
  qrCode?: string
  name: string
  slug: string
  description: string
  shortDescription: string
  type: ProductType
  status: ProductStatus
  visibility: ProductVisibility
  categories: Category['id'][]
  tags: Tag[]
  brand?: Brand
  supplier?: Supplier
  images: ProductImage[]
  videos?: ProductVideo[]
  files?: DigitalFile[]
  pricing: Pricing
  inventory: Inventory
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  shipping: ProductShipping
  seo: SEO
  metadata: ProductMetadata
  ratings: Ratings
  reviews: Review[]
  relatedProducts: ID[]
  upsellProducts: ID[]
  crossSellProducts: ID[]
  createdAt: DateTime
  updatedAt: DateTime
  publishedAt?: DateTime
}

export type ProductType = 'simple' | 'variable' | 'digital' | 'downloadable' | 'virtual' | 'service' | 'bundle' | 'gift-card'
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived' | 'out-of-stock' | 'discontinued'
export type ProductVisibility = 'visible' | 'hidden' | 'search-only' | 'catalog-only'

export interface ProductImage {
  id: ID
  url: URL
  thumbnail: URL
  alt?: string
  title?: string
  caption?: string
  isPrimary: boolean
  sortOrder: number
  dimensions?: {
    width: number
    height: number
  }
  size?: number
  mimeType?: string
  variants?: Record<string, URL>
}

export interface ProductVideo {
  id: ID
  url: URL
  thumbnail?: URL
  title: string
  description?: string
  duration?: number
  provider: 'youtube' | 'vimeo' | 'wistia' | 'custom'
}

export interface DigitalFile {
  id: ID
  name: string
  url: URL
  size: number
  mimeType: string
  downloads: number
  maxDownloads?: number
  expiryDate?: DateTime
}

export interface Pricing {
  price: number
  compareAtPrice?: number
  cost?: number
  profit?: number
  margin?: number
  wholesalePrice?: number
  retailPrice?: number
  currency: Currency
  taxClass?: string
  taxIncluded: boolean
  minimumPrice?: number
  maximumPrice?: number
  tieredPricing?: TieredPrice[]
  specialPrice?: SpecialPrice
}

export interface TieredPrice {
  quantity: number
  price: number
}

export interface SpecialPrice {
  price: number
  startDate: DateTime
  endDate: DateTime
  reason?: string
}

export interface Inventory {
  sku: string
  barcode?: string
  quantity: number
  reserved: number
  available: number
  backorderable: boolean
  preorderable: boolean
  lowStockThreshold: number
  outOfStockThreshold: number
  trackQuantity: boolean
  allowBackorders: boolean
  backorderLimit?: number
  minOrderQuantity: number
  maxOrderQuantity?: number
  inventoryHistory: InventoryHistory[]
  warehouse?: Warehouse
  location?: string
  stockStatus: StockStatus
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'preorder' | 'backorder'

export interface InventoryHistory {
  id: ID
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer'
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string
  reference?: string
  createdAt: DateTime
  createdBy: ID
}

export interface Warehouse {
  id: ID
  name: string
  code: string
  address: Address
  manager?: string
  phone?: Phone
  email?: Email
  isDefault: boolean
}

export interface ProductVariant {
  id: ID
  sku: string
  barcode?: string
  name: string
  options: VariantOption[]
  price: number
  compareAtPrice?: number
  cost?: number
  quantity: number
  reserved: number
  available: number
  lowStockThreshold: number
  images: ID[]
  isDefault: boolean
  isActive: boolean
  attributes: ProductAttribute[]
}

export interface VariantOption {
  id: ID
  name: string
  value: string
  attribute: Attribute
}

export interface Attribute {
  id: ID
  name: string
  slug: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'size'
  values: AttributeValue[]
  filterable: boolean
  visible: boolean
  sortOrder: number
}

export interface AttributeValue {
  id: ID
  value: string
  label: string
  swatch?: string
  sortOrder: number
}

export interface Category {
  id: ID
  name: string
  slug: string
  description?: string
  parentId?: ID
  children: ID[]
  image?: URL
  banner?: URL
  icon?: URL
  sortOrder: number
  productCount: number
  isActive: boolean
  seo: SEO
  createdAt: DateTime
  updatedAt: DateTime
}

export interface Brand {
  id: ID
  name: string
  slug: string
  description?: string
  logo?: URL
  website?: URL
  productCount: number
  isActive: boolean
}

export interface Supplier {
  id: ID
  name: string
  code: string
  contactName: string
  email: Email
  phone: Phone
  address: Address
  paymentTerms: string
  leadTime: number
  minimumOrder: number
  productCount: number
  rating: number
  status: 'active' | 'inactive'
}

export interface Tag {
  id: ID
  name: string
  slug: string
  count: number
}

// ============================================================================
// ORDERS
// ============================================================================

export interface Order {
  id: ID
  storeId: ID
  orderNumber: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  shippingTotal: number
  taxTotal: number
  discountTotal: number
  total: number
  currency: Currency
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
  billingAddress: Address
  shippingAddress: Address
  createdAt: DateTime
  updatedAt: DateTime
  processedAt?: DateTime
  fulfilledAt?: DateTime
  cancelledAt?: DateTime
  notes?: OrderNote[]
  tags: string[]
  tracking?: TrackingInfo[]
  refunds?: Refund[]
  transactions?: Transaction[]
  metadata: OrderMetadata
  source: OrderSource
  channel: OrderChannel
  ipAddress?: string
  userAgent?: string
  device?: Device
  location?: GeoLocation
  fraudScore?: number
  riskLevel?: RiskLevel
  isGift: boolean
  giftMessage?: string
  giftWrap?: boolean
}

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'completed' | 'cancelled' | 'refunded' | 'failed'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'voided' | 'failed'
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'delivered' | 'ready_for_pickup' | 'picked_up'
export type OrderSource = 'website' | 'mobile_app' | 'pos' | 'marketplace' | 'social' | 'phone' | 'email'
export type OrderChannel = 'direct' | 'search' | 'social' | 'email' | 'referral' | 'paid' | 'organic'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface OrderCustomer {
  id: ID
  email: Email
  firstName: string
  lastName: string
  fullName: string
  phone?: Phone
  company?: string
  taxExempt?: boolean
  marketingConsent?: boolean
}

export interface OrderItem {
  id: ID
  productId: ID
  variantId?: ID
  sku: string
  name: string
  quantity: number
  price: number
  compareAtPrice?: number
  cost?: number
  total: number
  tax: number
  taxRate: number
  discount: number
  discountTotal: number
  image?: URL
  weight?: number
  weightUnit: WeightUnit
  dimensions?: Dimensions
  isDigital: boolean
  isGift: boolean
  giftMessage?: string
  warranty?: Warranty
  metadata?: Record<string, any>
}

export interface Warranty {
  id: ID
  name: string
  duration: number
  terms: string
  price: number
}

export interface OrderNote {
  id: ID
  content: string
  type: 'public' | 'private' | 'system'
  createdBy: ID
  createdAt: DateTime
}

export interface TrackingInfo {
  id: ID
  carrier: string
  trackingNumber: string
  trackingUrl?: URL
  status: string
  estimatedDelivery?: DateTime
  deliveredAt?: DateTime
  events: TrackingEvent[]
}

export interface TrackingEvent {
  id: ID
  location: string
  description: string
  status: string
  timestamp: DateTime
}

export interface Refund {
  id: ID
  amount: number
  reason: string
  status: 'pending' | 'completed' | 'rejected'
  items: OrderItem[]
  paymentMethod: string
  transactionId?: string
  notes?: string
  createdBy: ID
  createdAt: DateTime
  processedAt?: DateTime
}

export interface Transaction {
  id: ID
  type: 'authorization' | 'capture' | 'sale' | 'refund' | 'void'
  amount: number
  currency: Currency
  status: 'pending' | 'success' | 'failed'
  paymentMethod: string
  gateway: string
  gatewayTransactionId: string
  responseCode?: string
  responseMessage?: string
  metadata: Record<string, any>
  createdAt: DateTime
}

export interface OrderMetadata {
  ipAddress?: string
  userAgent?: string
  device?: Device
  location?: GeoLocation
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  referer?: string
  landingPage?: string
  sessionId?: string
  customerId?: ID
  couponCode?: string
  discountCodes?: string[]
}

// ============================================================================
// CUSTOMERS
// ============================================================================

export interface Customer {
  id: ID
  storeId: ID
  email: Email
  firstName: string
  lastName: string
  fullName: string
  phone?: Phone
  avatar?: URL
  dateOfBirth?: DateTime
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  company?: string
  taxExempt?: boolean
  addresses: Address[]
  defaultAddressId?: ID
  groups: CustomerGroup[]
  tags: string[]
  notes?: CustomerNote[]
  segments: string[]
  metadata: CustomerMetadata
  stats: CustomerStats
  preferences: CustomerPreferences
  communications: CommunicationPreferences
  loyalty: LoyaltyInfo
  subscriptions: Subscription[]
  wishlist: WishlistItem[]
  recentlyViewed: Product[]
  paymentMethods: PaymentMethod[]
  createdAt: DateTime
  updatedAt: DateTime
  lastLoginAt?: DateTime
  lastPurchaseAt?: DateTime
  status: CustomerStatus
  verified: boolean
  twoFactorEnabled: boolean
}

export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'pending' | 'deleted'

export interface Address {
  id: ID
  type: 'shipping' | 'billing' | 'both'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: Phone
  email?: Email
  isDefault: boolean
  isVerified: boolean
  latitude?: number
  longitude?: number
  instructions?: string
}

export interface CustomerGroup {
  id: ID
  name: string
  description?: string
  type: 'automatic' | 'manual'
  conditions?: SegmentCondition[]
  discount?: Discount
  createdAt: DateTime
  updatedAt: DateTime
}

export interface CustomerNote {
  id: ID
  content: string
  type: 'general' | 'support' | 'sales' | 'marketing'
  createdBy: ID
  createdAt: DateTime
}

export interface CustomerMetadata {
  source?: string
  referrer?: string
  landingPage?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  tags?: string[]
  customFields?: Record<string, any>
}

export interface CustomerStats {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  firstOrderDate?: DateTime
  lastOrderDate?: DateTime
  lastActiveDate?: DateTime
  lifetimeValue: number
  predictedLTV: number
  churnProbability: number
  reviewCount: number
  averageRating: number
  refundCount: number
  refundTotal: number
  returnCount: number
}

export interface CustomerPreferences {
  newsletter: boolean
  marketingEmails: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  preferredCategories?: string[]
  preferredBrands?: string[]
  priceAlerts: boolean
  stockAlerts: boolean
  reviewReminders: boolean
  birthdayReminders: boolean
}

export interface CommunicationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  whatsapp: boolean
  messenger: boolean
  marketing: boolean
  transactional: boolean
  abandonedCart: boolean
  orderUpdates: boolean
  productUpdates: boolean
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone: Timezone
}

export interface LoyaltyInfo {
  points: number
  tier: LoyaltyTier
  pointsEarned: number
  pointsRedeemed: number
  pointsExpiring: number
  pointsExpiryDate?: DateTime
  referralCode: string
  referredBy?: ID
  referrals: number
  rewards: Reward[]
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'elite'

export interface Reward {
  id: ID
  name: string
  description: string
  pointsRequired: number
  discount?: number
  productId?: ID
  freeShipping: boolean
  expiresAt?: DateTime
  redeemedAt?: DateTime
}

export interface Subscription {
  id: ID
  name: string
  productId: ID
  variantId?: ID
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  nextDelivery: DateTime
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  paymentMethodId: ID
  addressId: ID
  createdAt: DateTime
  updatedAt: DateTime
}

export interface WishlistItem {
  id: ID
  productId: ID
  variantId?: ID
  addedAt: DateTime
  notes?: string
  priority?: 'low' | 'medium' | 'high'
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export interface AnalyticsData {
  dateRange: DateRange
  metrics: Metrics
  dimensions: Dimension[]
  segments: Segment[]
  comparisons: Comparison[]
  filters: Filter[]
  sort: Sort[]
  limit: number
  offset: number
}

export interface DateRange {
  start: DateTime
  end: DateTime
  label: string
  compareTo?: 'previous_period' | 'previous_year' | 'custom'
  compareStart?: DateTime
  compareEnd?: DateTime
}

export interface Metrics {
  revenue: Metric
  orders: Metric
  customers: Metric
  products: Metric
  conversion: Metric
  aov: Metric
  refunds: Metric
  returns: Metric
  traffic: Metric
  sessions: Metric
  pageviews: Metric
  bounceRate: Metric
  custom: Record<string, Metric>
}

export interface Metric {
  value: number
  previousValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  format: 'currency' | 'number' | 'percentage' | 'time' | 'decimal'
  label: string
  description?: string
}

export interface Dimension {
  name: string
  value: string
  count: number
  percentage: number
}

export interface Segment {
  id: ID
  name: string
  description?: string
  conditions: SegmentCondition[]
  count: number
  revenue: number
  conversion: number
}

export interface SegmentCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null'
  value: any
  value2?: any
}

export interface Comparison {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

export interface Filter {
  field: string
  operator: string
  value: any
}

export interface Sort {
  field: string
  direction: 'asc' | 'desc'
}

export interface Report {
  id: ID
  name: string
  description?: string
  type: 'sales' | 'customers' | 'products' | 'inventory' | 'marketing'
  metrics: string[]
  dimensions: string[]
  filters: Filter[]
  schedule?: ReportSchedule
  format: 'pdf' | 'csv' | 'excel' | 'json'
  recipients: Email[]
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: ID
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  day?: number
  hour?: number
  minute?: number
  timezone: Timezone
  lastRun?: DateTime
  nextRun?: DateTime
}

// ============================================================================
// MARKETING
// ============================================================================

export interface Campaign {
  id: ID
  name: string
  description?: string
  type: 'email' | 'sms' | 'push' | 'social' | 'display' | 'search'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  audience: CampaignAudience
  content: CampaignContent
  schedule: CampaignSchedule
  budget: CampaignBudget
  tracking: CampaignTracking
  stats: CampaignStats
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: ID
}

export interface CampaignAudience {
  segments: ID[]
  conditions: SegmentCondition[]
  size: number
  excludes?: ID[]
}

export interface CampaignContent {
  subject?: string
  preview?: string
  body: string
  images?: URL[]
  links?: URL[]
  cta?: {
    text: string
    url: URL
  }
}

export interface CampaignSchedule {
  startDate: DateTime
  endDate?: DateTime
  timezone: Timezone
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly'
  dayOfWeek?: number
  dayOfMonth?: number
  hour?: number
  minute?: number
}

export interface CampaignBudget {
  total: number
  spent: number
  remaining: number
  currency: Currency
  daily?: number
  monthly?: number
}

export interface CampaignTracking {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent?: string
  utmTerm?: string
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  bounced: number
  unsubscribed: number
  complained: number
  revenue: number
  roi: number
  ctr: number
  conversionRate: number
}

export interface Discount {
  id: ID
  code: string
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping'
  value: number
  minPurchase?: number
  maxDiscount?: number
  startDate: DateTime
  endDate: DateTime
  usageLimit?: number
  usageCount: number
  perCustomerLimit?: number
  products?: ID[]
  categories?: ID[]
  customers?: ID[]
  isActive: boolean
  createdAt: DateTime
  createdBy: ID
}

export interface Coupon {
  id: ID
  code: string
  discountId: ID
  expiresAt?: DateTime
  usedAt?: DateTime
  usedBy?: ID
  orderId?: ID
}

// ============================================================================
// INVENTORY & WAREHOUSE
// ============================================================================

export interface InventoryTransaction {
  id: ID
  type: 'receive' | 'transfer' | 'adjust' | 'sale' | 'return' | 'damage' | 'loss'
  productId: ID
  variantId?: ID
  quantity: number
  previousQuantity: number
  newQuantity: number
  location: string
  reference?: string
  notes?: string
  createdBy: ID
  createdAt: DateTime
}

export interface StockAlert {
  id: ID
  productId: ID
  variantId?: ID
  currentStock: number
  threshold: number
  type: 'low_stock' | 'out_of_stock' | 'overstock'
  status: 'active' | 'resolved' | 'ignored'
  createdAt: DateTime
  resolvedAt?: DateTime
}

export interface Reorder {
  id: ID
  productId: ID
  variantId?: ID
  quantity: number
  supplierId: ID
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  orderDate?: DateTime
  receivedDate?: DateTime
  expectedDate?: DateTime
  notes?: string
  createdBy: ID
  createdAt: DateTime
}

// ============================================================================
// SUPPORT & TICKETS
// ============================================================================

export interface Ticket {
  id: ID
  customerId: ID
  subject: string
  description: string
  status: TicketStatus
  priority: Priority
  category: string
  messages: TicketMessage[]
  attachments?: File[]
  assignedTo?: ID
  tags: string[]
  metadata: Record<string, any>
  createdAt: DateTime
  updatedAt: DateTime
  resolvedAt?: DateTime
  closedAt?: DateTime
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'

export interface TicketMessage {
  id: ID
  content: string
  type: 'customer' | 'staff' | 'system'
  staffName?: string
  attachments?: File[]
  createdAt: DateTime
}

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

export interface Review {
  id: ID
  productId: ID
  customerId: ID
  orderId?: ID
  rating: number
  title: string
  content: string
  pros?: string[]
  cons?: string[]
  images?: URL[]
  videos?: URL[]
  verified: boolean
  helpful: number
  unhelpful: number
  reported: boolean
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  response?: ReviewResponse
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReviewResponse {
  id: ID
  content: string
  staffName: string
  createdAt: DateTime
}

export interface Ratings {
  average: number
  count: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: Phone
  email?: Email
  isDefault?: boolean
  isVerified?: boolean
  latitude?: number
  longitude?: number
  instructions?: string
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: DimensionUnit
}

export interface Weight {
  value: number
  unit: WeightUnit
}

export interface GeoLocation {
  latitude: number
  longitude: number
  country?: string
  city?: string
  region?: string
  postalCode?: string
  timezone?: string
}

export interface Device {
  type: 'mobile' | 'tablet' | 'desktop' | 'bot'
  brand?: string
  model?: string
  os?: string
  osVersion?: string
  browser?: string
  browserVersion?: string
  screenResolution?: string
  language?: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isBot: boolean
}

export interface File {
  id: ID
  name: string
  url: URL
  size: number
  mimeType: string
  dimensions?: {
    width: number
    height: number
  }
  duration?: number
  createdAt: DateTime
}

export interface SEO {
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: URL
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: URL
  canonical?: URL
  noIndex: boolean
  noFollow: boolean
  schema?: Record<string, any>
}

export interface RateLimit {
  path: string
  maxRequests: number
  windowMs: number
}

export interface FirewallRules {
  allowedIPs?: string[]
  blockedIPs?: string[]
  allowedCountries?: string[]
  blockedCountries?: string[]
  allowedUserAgents?: string[]
  blockedUserAgents?: string[]
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  username?: string
  password?: string
  fromEmail: Email
  fromName: string
}

export interface IntegrationSettings {
  shopify?: ShopifyConfig
  woocommerce?: WooCommerceConfig
  magento?: MagentoConfig
  bigcommerce?: BigCommerceConfig
  stripe?: StripeConfig
  paypal?: PayPalConfig
  klaviyo?: KlaviyoConfig
  mailchimp?: MailchimpConfig
  quickbooks?: QuickBooksConfig
  xero?: XeroConfig
}

export interface ShopifyConfig {
  shop: string
  apiKey: string
  apiSecret: string
  accessToken: string
  webhooks: boolean
}

export interface WooCommerceConfig {
  url: string
  consumerKey: string
  consumerSecret: string
  webhooks: boolean
}

export interface MagentoConfig {
  url: string
  accessToken: string
  webhooks: boolean
}

export interface BigCommerceConfig {
  storeHash: string
  clientId: string
  accessToken: string
  webhooks: boolean
}

export interface StripeConfig {
  publishableKey: string
  secretKey: string
  webhookSecret: string
}

export interface PayPalConfig {
  clientId: string
  clientSecret: string
  mode: 'sandbox' | 'live'
  webhookId: string
}

export interface KlaviyoConfig {
  apiKey: string
  listId: string
}

export interface MailchimpConfig {
  apiKey: string
  listId: string
  server: string
}

export interface QuickBooksConfig {
  clientId: string
  clientSecret: string
  companyId: string
  accessToken: string
  refreshToken: string
  expiresAt: DateTime
}

export interface XeroConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  accessToken: string
  refreshToken: string
  expiresAt: DateTime
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
}

export interface ApiMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface SearchParams extends PaginationParams {
  query?: string
  filters?: Record<string, any>
  fields?: string[]
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface WebhookEvent {
  id: ID
  type: string
  data: any
  timestamp: DateTime
  signature?: string
}

export interface AuditLog {
  id: ID
  userId: ID
  action: string
  resource: string
  resourceId?: ID
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: DateTime
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export * from './product'
export * from './order'
export * from './customer'
export * from './store'
export * from './analytics'
export * from './marketing'
export * from './inventory'
export * from './support'
