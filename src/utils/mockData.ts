import { faker } from '@faker-js/faker';
import { subDays, subMonths } from 'date-fns';

// ============================================================================
// SIMPLE TYPE DEFINITIONS
// ============================================================================

interface Product {
  id: string;
  storeId: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  tags: string[];
  status: 'active' | 'draft' | 'inactive';
  createdAt: Date;
}

interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: any[];
  tags: string[];
  createdAt: Date;
}

interface Customer {
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  tags: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const MOCK_CONFIG = {
  productCount: 50,
  orderCount: 100,
  customerCount: 200,
  storeCount: 1
};

// ============================================================================
// UTILITY FUNCTIONS (only what we actually use)
// ============================================================================

const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2): number => 
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const randomArrayItem = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ============================================================================
// STATIC DATA POOLS
// ============================================================================

const PRODUCT_NAMES = [
  'Wireless Headphones', 'Gaming Mouse', '4K Monitor', 'Mechanical Keyboard',
  'USB-C Hub', 'Phone Case', 'Screen Protector', 'Power Bank',
  'Smart Watch', 'Bluetooth Speaker', 'Laptop Stand', 'Webcam'
];

const CATEGORIES = [
  'Electronics', 'Computers', 'Audio', 'Gaming', 'Accessories'
];

const CUSTOMER_NAMES = [
  'John Smith', 'Emma Watson', 'Michael Chen', 'Sarah Johnson', 'David Brown',
  'Lisa Anderson', 'James Wilson', 'Maria Garcia', 'Robert Taylor', 'Jennifer Lee'
];

const TAG_POOL = [
  'vip', 'new', 'repeat', 'at-risk', 'high-value', 'electronics', 'gaming', 'premium'
];

// ============================================================================
// GENERATORS
// ============================================================================

export const generateId = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
};

export const generateEmail = (name: string): string => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  return `${name.toLowerCase().replace(/\s+/g, '.')}@${randomArrayItem(domains)}`;
};

export const generatePhone = (): string => {
  return `(${randomInt(200, 999)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
};

// ============================================================================
// PRODUCT GENERATOR
// ============================================================================

export const generateProduct = (storeId: string): Product => {
  const name = randomArrayItem(PRODUCT_NAMES);
  
  // Generate 1-3 random tags
  const tagCount = randomInt(1, 3);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(randomArrayItem(TAG_POOL));
  }
  
  return {
    id: generateId('prod'),
    storeId,
    sku: `SKU-${randomInt(1000, 9999)}`,
    name,
    description: faker.lorem.sentence(),
    price: randomFloat(19.99, 499.99),
    category: randomArrayItem(CATEGORIES),
    stock: randomInt(0, 100),
    image: `https://picsum.photos/200/200?random=${randomInt(1, 1000)}`,
    tags,
    status: randomArrayItem(['active', 'active', 'active', 'draft']),
    createdAt: randomDate(subMonths(new Date(), 6), new Date())
  };
};

// ============================================================================
// CUSTOMER GENERATOR
// ============================================================================

export const generateCustomer = (storeId: string): Customer => {
  const name = randomArrayItem(CUSTOMER_NAMES);
  const totalOrders = randomInt(0, 20);
  const totalSpent = totalOrders * randomFloat(50, 200);
  
  // Generate 0-3 random tags
  const tagCount = randomInt(0, 3);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(randomArrayItem(TAG_POOL));
  }
  
  return {
    id: generateId('cust'),
    storeId,
    name,
    email: generateEmail(name),
    phone: generatePhone(),
    totalOrders,
    totalSpent,
    tags,
    status: randomArrayItem(['active', 'active', 'active', 'inactive']),
    createdAt: randomDate(subMonths(new Date(), 12), new Date())
  };
};

// ============================================================================
// ORDER GENERATOR
// ============================================================================

export const generateOrder = (
  storeId: string,
  customers: Customer[]
): Order => {
  const customer = randomArrayItem(customers);
  const total = randomFloat(50, 500);
  
  // Generate 0-2 random tags
  const tagCount = randomInt(0, 2);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(randomArrayItem(['gift', 'priority', 'express']));
  }
  
  return {
    id: generateId('ord'),
    storeId,
    orderNumber: `ORD-${randomInt(10000, 99999)}`,
    customerName: customer.name,
    customerEmail: customer.email,
    total,
    status: randomArrayItem(['pending', 'processing', 'completed', 'cancelled']),
    items: [],
    tags,
    createdAt: randomDate(subDays(new Date(), 30), new Date())
  };
};

// ============================================================================
// MASTER DATA GENERATOR
// ============================================================================

export const generateMockData = () => {
  console.log('🚀 Generating mock data...');
  
  const storeId = 'store_1';
  
  // Generate products
  const products: Product[] = [];
  for (let i = 0; i < MOCK_CONFIG.productCount; i++) {
    products.push(generateProduct(storeId));
  }
  
  // Generate customers
  const customers: Customer[] = [];
  for (let i = 0; i < MOCK_CONFIG.customerCount; i++) {
    customers.push(generateCustomer(storeId));
  }
  
  // Generate orders
  const orders: Order[] = [];
  for (let i = 0; i < MOCK_CONFIG.orderCount; i++) {
    orders.push(generateOrder(storeId, customers));
  }
  
  // Sort orders by date (newest first)
  orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  console.log('✅ Mock data generated successfully!');
  console.log(`📦 ${products.length} products`);
  console.log(`👥 ${customers.length} customers`);
  console.log(`🛍️ ${orders.length} orders`);
  
  return {
    products,
    customers,
    orders
  };
};

export default generateMockData;
