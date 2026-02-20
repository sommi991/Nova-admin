// ============================================================================
// CORE TYPES
// ============================================================================

export type ID = string;
export type DateTime = Date;
export type Email = string;
export type Phone = string;
export type URL = string;
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
export type WeightUnit = 'kg' | 'lb' | 'g' | 'oz';
export type DimensionUnit = 'cm' | 'in' | 'm' | 'ft';
export type Status = 'active' | 'inactive' | 'draft' | 'archived' | 'deleted';
export type Priority = 'low' | 'medium' | 'high' | 'critical' | 'urgent';
export type Theme = 'dark' | 'light' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'zh' | 'ar' | 'ru';
export type Timezone = string;

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer' | 'support';

export interface User {
  id: ID;
  email: Email;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: URL;
  role: UserRole;
  permissions: Permission[];
  stores: string[];
  preferences: UserPreferences;
  twoFactorEnabled: boolean;
  lastLoginAt?: DateTime;
  lastActiveAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
  status: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  theme: Theme;
  language: Language;
  timezone: Timezone;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: Currency;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  dashboard: DashboardPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  orderAlerts: boolean;
  inventoryAlerts: boolean;
  marketingAlerts: boolean;
  systemAlerts: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface DashboardPreferences {
  defaultView: 'analytics' | 'orders' | 'products' | 'customers';
  widgets: string[];
  layout: string;
  refreshInterval: number;
}

export interface PrivacyPreferences {
  shareData: boolean;
  analytics: boolean;
  marketingCookies: boolean;
  functionalCookies: boolean;
}

export interface Permission {
  id: ID;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, any>;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived' | 'out-of-stock' | 'discontinued';
export type ProductVisibility = 'visible' | 'hidden' | 'search-only' | 'catalog-only';
export type ProductType = 'simple' | 'variable' | 'digital' | 'downloadable' | 'virtual' | 'service' | 'bundle' | 'gift-card';

export interface Product {
  id: ID;
  storeId: ID;
  sku: string;
  barcode?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: ProductType;
  status: ProductStatus;
  visibility: ProductVisibility;
  categories: string[];
  tags: string[];
  brand?: Brand;
  images: ProductImage[];
  price: number;
  compareAtPrice?: number;
  cost?: number;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  ratings: Ratings;
  createdAt: DateTime;
  updatedAt: DateTime;
  publishedAt?: DateTime;
}

export interface ProductImage {
  id: ID;
  url: URL;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Brand {
  id: ID;
  name: string;
  slug: string;
  logo?: URL;
}

export interface Ratings {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'completed' | 'cancelled' | 'refunded' | 'failed';
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'voided' | 'failed';
export type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'delivered' | 'ready_for_pickup' | 'picked_up';
export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'gift_card';

export interface Order {
  id: ID;
  storeId: ID;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: OrderNote[];
  tags: string[];
  createdAt: DateTime;
  updatedAt: DateTime;
  processedAt?: DateTime;
  fulfilledAt?: DateTime;
  cancelledAt?: DateTime;
}

export interface OrderCustomer {
  id: ID;
  email: Email;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: Phone;
}

export interface OrderItem {
  id: ID;
  productId: ID;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: URL;
}

export interface OrderNote {
  id: ID;
  content: string;
  type: 'public' | 'private' | 'system';
  createdBy: ID;
  createdAt: DateTime;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export type CustomerStatus = 'active' | 'inactive' | 'blocked' | 'pending' | 'deleted';

export interface Customer {
  id: ID;
  storeId: ID;
  email: Email;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: Phone;
  avatar?: URL;
  addresses: Address[];
  tags: string[];
  notes?: CustomerNote[];
  stats: CustomerStats;
  preferences: CustomerPreferences;
  createdAt: DateTime;
  updatedAt: DateTime;
  lastLoginAt?: DateTime;
  lastPurchaseAt?: DateTime;
  status: CustomerStatus;
  verified: boolean;
}

export interface Address {
  id: ID;
  type: 'shipping' | 'billing' | 'both';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: Phone;
  isDefault: boolean;
}

export interface CustomerNote {
  id: ID;
  content: string;
  type: 'general' | 'support' | 'sales';
  createdBy: ID;
  createdAt: DateTime;
}

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate?: DateTime;
  lastOrderDate?: DateTime;
  lastActiveDate?: DateTime;
  lifetimeValue: number;
}

export interface CustomerPreferences {
  newsletter: boolean;
  marketingEmails: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  priceAlerts: boolean;
  stockAlerts: boolean;
  reviewReminders: boolean;
  birthdayReminders: boolean;
}

// ============================================================================
// STORE TYPES
// ============================================================================

export interface Store {
  id: ID;
  name: string;
  slug: string;
  domain?: string;
  logo?: URL;
  email: Email;
  phone?: Phone;
  address?: Address;
  currency: Currency;
  timezone: Timezone;
  language: Language;
  status: 'active' | 'maintenance' | 'inactive';
  settings: StoreSettings;
  features: StoreFeatures;
  stats: StoreStats;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface StoreSettings {
  tax: TaxSettings;
  shipping: ShippingSettings;
  payments: PaymentSettings;
  checkout: CheckoutSettings;
  email: EmailSettings;
  security: SecuritySettings;
}

export interface TaxSettings {
  rates: TaxRate[];
  autoCalculate: boolean;
  taxIncluded: boolean;
}

export interface TaxRate {
  id: ID;
  name: string;
  rate: number;
  country: string;
  state?: string;
  priority: number;
}

export interface ShippingSettings {
  origin: Address;
  methods: ShippingMethod[];
  zones: ShippingZone[];
  autoRate: boolean;
  freeShippingThreshold?: number;
}

export interface ShippingMethod {
  id: ID;
  name: string;
  code: string;
  carrier: string;
  rate: number;
  currency: Currency;
  zones: string[];
  estimatedDays: [number, number];
}

export interface ShippingZone {
  id: ID;
  name: string;
  countries: string[];
  methods: string[];
}

export interface PaymentSettings {
  gateways: PaymentGateway[];
  currency: Currency;
  acceptedCards: string[];
  testMode: boolean;
  autoCapture: boolean;
}

export interface PaymentGateway {
  id: ID;
  name: string;
  provider: 'stripe' | 'paypal' | 'square';
  enabled: boolean;
  testMode: boolean;
}

export interface CheckoutSettings {
  guestCheckout: boolean;
  accountCreation: boolean;
  abandonedCart: AbandonedCartSettings;
}

export interface AbandonedCartSettings {
  enabled: boolean;
  delay: number;
  emailTemplate: string;
  discount?: number;
}

export interface EmailSettings {
  fromEmail: Email;
  fromName: string;
  logo?: URL;
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  id: ID;
  name: string;
  subject: string;
  body: string;
  event: string;
}

export interface SecuritySettings {
  requireLogin: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  ipWhitelist?: string[];
}

export interface StoreFeatures {
  multiCurrency: boolean;
  multiLanguage: boolean;
  subscriptions: boolean;
  giftCards: boolean;
  wishlists: boolean;
  reviews: boolean;
  backorders: boolean;
  digitalProducts: boolean;
}

export interface StoreStats {
  products: number;
  orders: number;
  customers: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsData {
  dateRange: DateRange;
  metrics: Metrics;
  dimensions: Dimension[];
  segments: Segment[];
  comparisons: Comparison[];
  filters: Filter[];
  sort: Sort[];
  limit: number;
  offset: number;
}

export interface DateRange {
  start: DateTime;
  end: DateTime;
  label: string;
  compareTo?: 'previous_period' | 'previous_year';
  compareStart?: DateTime;
  compareEnd?: DateTime;
}

export interface Metrics {
  revenue: Metric;
  orders: Metric;
  customers: Metric;
  products: Metric;
  conversion: Metric;
  aov: Metric;
  refunds: Metric;
  returns: Metric;
  traffic: Metric;
  sessions: Metric;
  pageviews: Metric;
  bounceRate: Metric;
  custom: Record<string, Metric>;
}

export interface Metric {
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'number' | 'percentage' | 'time' | 'decimal';
  label: string;
  description?: string;
}

export interface Dimension {
  name: string;
  value: string;
  count: number;
  percentage: number;
}

export interface Segment {
  id: ID;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  count: number;
  revenue: number;
  conversion: number;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  value2?: any;
}

export interface Comparison {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Filter {
  field: string;
  operator: string;
  value: any;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// TAG TYPE
// ============================================================================

export interface Tag {
  id: ID;
  name: string;
  slug: string;
  count: number;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// No external imports - everything is defined here!
