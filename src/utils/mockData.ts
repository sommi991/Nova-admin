import { faker } from '@faker-js/faker';
import { subDays, subHours, subMonths, addDays } from 'date-fns';

// ============================================================================
// SIMPLE TYPE DEFINITIONS (to avoid import errors)
// ============================================================================

type ProductStatus = 'active' | 'draft' | 'inactive' | 'archived';
type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'completed' | 'cancelled';
type CustomerStatus = 'active' | 'inactive' | 'blocked';
type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'failed';
type FulfillmentStatus = 'unfulfilled' | 'fulfilled' | 'shipped' | 'delivered';

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
  tags: string[]; // Simple string array
  status: ProductStatus;
  createdAt: Date;
}

interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  items: any[];
  createdAt: Date;
  tags: string[]; // Simple string array
}

interface Customer {
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  tags: string[]; // Simple string array
  status: CustomerStatus;
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
// UTILITY FUNCTIONS
// ============================================================================

const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2): number => 
  Number((Math.random() * (max - min) + min).toFixed(decimals));

const randomBoolean = (probability = 0.5): boolean => Math.random() < probability;

const randomArrayItem = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const randomArraySlice = <T>(array: T[], min = 1, max = array.length): T[] => {
  const count = randomInt(min, max);
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
};

const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ============================================================================
// STATIC DATA POOLS
// ============================================================================

const PRODUCT_NAMES = [
  'Wireless Headphones', 'Gaming Mouse', '4K Monitor', 'Mechanical Keyboard',
  'USB-C Hub', 'Phone Case', 'Screen Protector', 'Power Bank',
  'Smart Watch', 'Bluetooth Speaker', 'Laptop Stand', 'Webcam',
  'Microphone', 'Desk Mat', 'Gaming Chair', 'External SSD'
];

const CATEGORIES = [
  'Electronics', 'Computers', 'Audio', 'Gaming', 'Accessories'
];

const CUSTOMER_NAMES = [
  'John Smith', 'Emma Watson', 'Michael Chen', 'Sarah Johnson', 'David Brown',
  'Lisa Anderson', 'James Wilson', 'Maria Garcia', 'Robert Taylor', 'Jennifer Lee'
];

const TAG_POOL = [
  'vip', 'new', 'repeat', 'at-risk', 'high-value', 'low-value',
  'electronics', 'gaming', 'audio', 'premium', 'budget', 'sale'
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
  const id = generateId('prod');
  const name = randomArrayItem(PRODUCT_NAMES);
  const price = randomFloat(19.99, 499.99);
  const stock = randomInt(0, 100);
  
  // Generate 1-3 random tags
  const tagCount = randomInt(1, 3);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(randomArrayItem(TAG_POOL));
  }
  
  return {
    id,
    storeId,
    sku: `SKU-${randomInt(1000, 9999)}`,
    name,
    description: faker.lorem.sentence(),
    price,
    category: randomArrayItem(CATEGORIES),
    stock,
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
  const id = generateId('cust');
  const name = randomArrayItem(CUSTOMER_NAMES);
  const email = generateEmail(name);
  const totalOrders = randomInt(0, 20);
  const totalSpent = totalOrders * randomFloat(50, 200);
  
  // Generate 0-3 random tags
  const tagCount = randomInt(0, 3);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(randomArrayItem(TAG_POOL));
  }
  
  return {
    id,
    storeId,
    name,
    email,
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
  customers: Customer[],
  products: Product[]
): Order => {
  const id = generateId('ord');
  const customer = randomArrayItem(customers);
  const itemCount = randomInt(1, 5);
  const total = itemCount * randomFloat(50, 200);
  
  // Generate 0-2 random tags
  const tagCount = randomInt(0, 2);
  const tags: string[] = [];
  for (let i = 0; i < tagCount; i++) {
    tags.push(randomArrayItem(['gift', 'priority', 'express', 'international']));
  }
  
  return {
    id,
    storeId,
    orderNumber: `ORD-${randomInt(10000, 99999)}`,
    customerName: customer.name,
    customerEmail: customer.email,
    total,
    status: randomArrayItem(['pending', 'processing', 'completed', 'cancelled']),
    items: Array(itemCount).fill({}),
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
    orders.push(generateOrder(storeId, customers, products));
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
