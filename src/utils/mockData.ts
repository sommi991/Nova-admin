import { faker } from '@faker-js/faker';
import { subDays, subHours, subMonths, addDays } from 'date-fns';
import type {
  Product,
  Order,
  Customer,
  Store,
  User,
  Category,
  Brand,
  Review,
  Discount,
  Campaign,
  InventoryTransaction,
  Ticket,
  AnalyticsData,
  ProductStatus,
  OrderStatus,
  CustomerStatus,
  PaymentStatus,
  FulfillmentStatus
} from '../types';

// Initialize faker with seed for consistent data
faker.seed(123);

// ============================================================================
// CONFIGURATION
// ============================================================================

export const MOCK_CONFIG = {
  productCount: 250,
  orderCount: 500,
  customerCount: 1000,
  categoryCount: 20,
  brandCount: 30,
  reviewCount: 2000,
  discountCount: 25,
  campaignCount: 15,
  ticketCount: 50,
  storeCount: 3
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2): number => 
  Number((Math.random() * (max - min) + min).toFixed(decimals));
const randomBoolean = (probability = 0.5): boolean => Math.random() < probability;
const randomArrayItem = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const randomArraySlice = <T>(array: T[], min = 1, max = array.length): T[] => {
  const count = randomInt(min, max);
  return faker.helpers.shuffle([...array]).slice(0, count);
};

// ============================================================================
// STATIC DATA POOLS
// ============================================================================

export const COUNTRIES = [
  { code: 'US', name: 'United States', states: ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'] },
  { code: 'CA', name: 'Canada', states: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'] },
  { code: 'GB', name: 'United Kingdom', states: ['ENG', 'SCT', 'WLS', 'NIR'] },
  { code: 'AU', name: 'Australia', states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'] },
  { code: 'DE', name: 'Germany', states: ['BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'NI', 'MV', 'NW'] },
  { code: 'FR', name: 'France', states: ['IDF', 'ARA', 'HDF', 'NAQ', 'OCC', 'PDL', 'PAC', 'BRE', 'NOR', 'CVL'] }
];

export const CATEGORY_NAMES = [
  'Electronics', 'Computers', 'Smartphones', 'Tablets', 'Wearables',
  'Audio', 'Cameras', 'Gaming', 'TV & Video', 'Home Appliances',
  'Fashion', 'Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Clothing',
  'Shoes', 'Accessories', 'Jewelry', 'Watches', 'Bags',
  'Home & Garden', 'Furniture', 'Decor', 'Kitchen', 'Bedding',
  'Bath', 'Gardening', 'Tools', 'Pet Supplies',
  'Sports', 'Exercise', 'Outdoors', 'Camping', 'Cycling',
  'Fitness', 'Team Sports', 'Water Sports', 'Winter Sports',
  'Beauty', 'Skincare', 'Makeup', 'Hair Care', 'Fragrance',
  'Personal Care', 'Health', 'Wellness', 'Vitamins',
  'Books', 'Music', 'Movies', 'Games', 'Toys',
  'Baby', 'Kids', 'School Supplies', 'Office Supplies',
  'Automotive', 'Parts', 'Accessories', 'Tools', 'Motorcycle',
  'Groceries', 'Food', 'Beverages', 'Snacks', 'Organic'
];

export const BRAND_NAMES = [
  'TechPro', 'SoundMaster', 'VisionPlus', 'GameX', 'HomeStyle',
  'FashionNow', 'SportElite', 'BeautyGlow', 'PetLove', 'BookWorm',
  'AutoMax', 'OfficePro', 'MusicArt', 'CraftMaster', 'BabyJoy',
  'GreenGarden', 'ToolTech', 'FitnessFirst', 'OutdoorLife', 'TravelLite',
  'LuxuryLiving', 'BudgetSmart', 'PremiumChoice', 'EcoFriendly', 'SmartHome',
  'DigitalLife', 'ConnectPlus', 'PowerMax', 'SpeedTech', 'QualityFirst'
];

export const PRODUCT_NAMES = {
  Electronics: [
    'Wireless Headphones', 'Bluetooth Speaker', 'Smart Watch', 'Fitness Tracker',
    'Power Bank', 'USB-C Hub', 'Phone Case', 'Screen Protector',
    'Laptop Stand', 'Webcam', 'Microphone', 'Streaming Light',
    'VR Headset', 'Drone', 'Action Camera', 'Gimbal Stabilizer',
    'Smart Plug', 'WiFi Router', 'Range Extender', 'Mesh System'
  ],
  Computers: [
    'Gaming Laptop', 'Ultrabook', 'Desktop Computer', 'All-in-One PC',
    'Gaming Mouse', 'Mechanical Keyboard', 'Gaming Monitor', 'USB Microphone',
    'External SSD', 'Portable Hard Drive', 'USB Flash Drive', 'Memory Card',
    'Graphics Card', 'Processor', 'Motherboard', 'RAM', 'Power Supply',
    'Computer Case', 'CPU Cooler', 'Thermal Paste'
  ],
  Fashion: [
    'Cotton T-Shirt', 'Denim Jeans', 'Hoodie', 'Sweater', 'Jacket',
    'Winter Coat', 'Summer Dress', 'Skirt', 'Blouse', 'Shirt',
    'Sneakers', 'Running Shoes', 'Boots', 'Sandals', 'Loafers',
    'Baseball Cap', 'Beanie', 'Sun Hat', 'Scarf', 'Gloves',
    'Sunglasses', 'Watch', 'Bracelet', 'Necklace', 'Ring'
  ],
  'Home & Garden': [
    'Coffee Maker', 'Blender', 'Toaster', 'Microwave', 'Air Fryer',
    'Vacuum Cleaner', 'Robot Vacuum', 'Mop', 'Iron', 'Steamer',
    'Desk Lamp', 'Floor Lamp', 'Ceiling Light', 'String Lights',
    'Plant Pot', 'Garden Tools', 'Hose', 'Sprinkler', 'Bird Feeder'
  ]
};

export const PRODUCT_DESCRIPTIONS = [
  'High-quality product with premium features and excellent build quality.',
  'Perfect for everyday use. Durable and reliable.',
  'Latest model with cutting-edge technology and innovative design.',
  'Customer favorite with thousands of 5-star reviews.',
  'Great value for money. Affordable without compromising quality.',
  'Professional grade equipment for serious users.',
  'Easy to use, even for beginners. Comes with detailed instructions.',
  'Eco-friendly and sustainable. Made from recycled materials.',
  'Limited edition with unique design and features.',
  'Best seller in its category. Trusted by millions.'
];

export const REVIEW_TITLES = [
  'Excellent product!', 'Great value', 'Works perfectly', 'Highly recommend',
  'Good quality', 'Decent for the price', 'Exceeded expectations', 'Love it!',
  'Perfect for my needs', 'Would buy again', 'Five stars', 'Amazing!',
  'Best purchase ever', 'Exactly what I needed', 'Super happy', 'Worth every penny'
];

export const REVIEW_CONTENTS = [
  'This product is amazing! The quality is top-notch and it works perfectly.',
  'Great value for money. Shipping was fast and packaging was secure.',
  'I\'ve been using this for a week now and I\'m very impressed.',
  'Perfect for what I needed. Would definitely recommend to others.',
  'Good product but could be better. Still, worth the price.',
  'Exceeded my expectations. The quality is better than I thought.',
  'Works as described. No complaints at all.',
  'The customer service was excellent when I had a question.',
  'Shipping took a bit longer than expected but product is great.',
  'Best purchase I\'ve made this year. Highly recommended!'
];

// ============================================================================
// GENERATORS
// ============================================================================

export const generateId = (prefix: string): string => {
  return `${prefix}_${faker.string.alphanumeric(8).toUpperCase()}`;
};

export const generateEmail = (firstName: string, lastName: string): string => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomArrayItem(domains)}`;
};

export const generatePhone = (): string => {
  return `+1 ${faker.string.numeric(3)}-${faker.string.numeric(3)}-${faker.string.numeric(4)}`;
};

export const generateAddress = (countryCode?: string) => {
  const country = countryCode 
    ? COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0]
    : randomArrayItem(COUNTRIES);
  
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: randomBoolean(0.3) ? faker.company.name() : undefined,
    address1: faker.location.streetAddress(),
    address2: randomBoolean(0.2) ? faker.location.secondaryAddress() : undefined,
    city: faker.location.city(),
    state: randomArrayItem(country.states),
    postalCode: faker.location.zipCode(),
    country: country.code,
    phone: generatePhone(),
    email: generateEmail(faker.person.firstName(), faker.person.lastName()),
    isDefault: randomBoolean(0.3)
  };
};

// ============================================================================
// STORE GENERATOR
// ============================================================================

export const generateStore = (): Store => {
  const id = generateId('store');
  const name = faker.company.name();
  
  return {
    id,
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    domain: `${faker.helpers.slugify(name)}.com`,
    logo: faker.image.url(),
    favicon: faker.image.url(),
    brandColor: faker.color.rgb(),
    email: generateEmail('store', name),
    phone: generatePhone(),
    address: generateAddress('US'),
    currency: randomArrayItem(['USD', 'EUR', 'GBP']),
    timezone: 'America/New_York',
    language: 'en',
    status: randomArrayItem(['active', 'active', 'active', 'maintenance']),
    settings: {
      tax: {
        rates: [],
        autoCalculate: true,
        taxIncluded: false,
        taxJarEnabled: false,
        nexusAddresses: []
      },
      shipping: {
        origin: generateAddress('US'),
        methods: [],
        zones: [],
        packages: [],
        carriers: [],
        autoRate: true
      },
      payments: {
        gateways: [],
        currency: 'USD',
        acceptedCards: ['visa', 'mastercard', 'amex'],
        testMode: false,
        autoCapture: true
      },
      checkout: {
        guestCheckout: true,
        accountCreation: true,
        termsUrl: 'https://example.com/terms',
        privacyUrl: 'https://example.com/privacy',
        abandonedCart: {
          enabled: true,
          delay: 60,
          emailTemplate: 'abandoned-cart',
          discount: 10
        }
      },
      email: {
        fromEmail: `noreply@${faker.helpers.slugify(name)}.com`,
        fromName: name,
        templates: []
      },
      security: {
        requireLogin: false,
        twoFactorAuth: false,
        sessionTimeout: 3600,
        rateLimiting: [],
        firewall: {
          allowedIPs: [],
          blockedIPs: []
        }
      },
      integrations: {}
    },
    features: {
      multiCurrency: true,
      multiLanguage: true,
      subscriptions: randomBoolean(),
      giftCards: randomBoolean(),
      wishlists: true,
      reviews: true,
      backorders: randomBoolean(),
      preOrders: randomBoolean(),
      digitalProducts: randomBoolean(),
      downloadableProducts: randomBoolean(),
      customizableProducts: randomBoolean()
    },
    stats: {
      products: randomInt(100, 1000),
      orders: randomInt(1000, 10000),
      customers: randomInt(500, 5000),
      revenue: randomInt(50000, 500000),
      conversionRate: randomFloat(1, 5),
      avgOrderValue: randomFloat(50, 200)
    },
    createdAt: subMonths(new Date(), randomInt(1, 24)),
    updatedAt: new Date()
  };
};

// ============================================================================
// USER GENERATOR
// ============================================================================

export const generateUser = (storeId?: string): User => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const id = generateId('user');
  
  return {
    id,
    email: generateEmail(firstName, lastName),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    avatar: faker.image.avatar(),
    role: randomArrayItem(['super_admin', 'admin', 'manager', 'editor', 'viewer']),
    permissions: [],
    stores: storeId ? [storeId] : [],
    preferences: {
      theme: randomArrayItem(['dark', 'light']),
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MMM dd, yyyy',
      timeFormat: randomArrayItem(['12h', '24h']),
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        sms: randomBoolean(),
        inApp: true,
        orderAlerts: true,
        inventoryAlerts: true,
        marketingAlerts: randomBoolean(),
        systemAlerts: true
      },
      accessibility: {
        reducedMotion: randomBoolean(0.1),
        highContrast: randomBoolean(0.1),
        fontSize: 'medium',
        screenReader: randomBoolean(0.05),
        keyboardNavigation: true
      },
      dashboard: {
        defaultView: 'analytics',
        widgets: ['revenue', 'orders', 'customers', 'products'],
        layout: 'grid',
        refreshInterval: 30
      },
      privacy: {
        shareData: randomBoolean(0.7),
        analytics: true,
        marketingCookies: randomBoolean(0.5),
        functionalCookies: true
      }
    },
    twoFactorEnabled: randomBoolean(0.2),
    lastLoginAt: subHours(new Date(), randomInt(1, 72)),
    lastActiveAt: subHours(new Date(), randomInt(0, 24)),
    createdAt: subMonths(new Date(), randomInt(1, 36)),
    updatedAt: new Date(),
    status: randomArrayItem(['active', 'active', 'active', 'inactive']),
    metadata: {}
  };
};

// ============================================================================
// CATEGORY GENERATOR
// ============================================================================

export const generateCategory = (parentId?: string): Category => {
  const id = generateId('cat');
  const name = randomArrayItem(CATEGORY_NAMES);
  
  return {
    id,
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: randomBoolean(0.7) ? faker.lorem.sentence() : undefined,
    parentId,
    children: [],
    image: faker.image.url(),
    banner: randomBoolean(0.3) ? faker.image.url() : undefined,
    icon: randomBoolean(0.5) ? faker.image.url() : undefined,
    sortOrder: randomInt(0, 100),
    productCount: randomInt(0, 50),
    isActive: randomBoolean(0.9),
    seo: {
      title: `Buy ${name} Online`,
      description: faker.lorem.paragraph(),
      keywords: [name, 'shop', 'buy online'],
      noIndex: false,
      noFollow: false
    },
    createdAt: subMonths(new Date(), randomInt(1, 24)),
    updatedAt: new Date()
  };
};

// ============================================================================
// BRAND GENERATOR
// ============================================================================

export const generateBrand = (): Brand => {
  const id = generateId('brand');
  const name = randomArrayItem(BRAND_NAMES);
  
  return {
    id,
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    description: randomBoolean(0.7) ? faker.company.catchPhrase() : undefined,
    logo: faker.image.url(),
    website: `https://${faker.helpers.slugify(name)}.com`,
    productCount: randomInt(5, 100),
    isActive: randomBoolean(0.95)
  };
};

// ============================================================================
// PRODUCT GENERATOR
// ============================================================================

export const generateProduct = (
  storeId: string,
  categories: Category[],
  brands: Brand[]
): Product => {
  const id = generateId('prod');
  const category = randomArrayItem(categories);
  const brand = randomArrayItem(brands);
  const categoryName = category.name;
  const productName = randomArrayItem(
    PRODUCT_NAMES[categoryName as keyof typeof PRODUCT_NAMES] || PRODUCT_NAMES.Electronics
  );
  const fullName = `${brand.name} ${productName}`;
  
  const price = randomFloat(19.99, 999.99);
  const cost = price * randomFloat(0.4, 0.7);
  const quantity = randomInt(0, 100);
  const sold = randomInt(0, 200);
  
  return {
    id,
    storeId,
    sku: faker.string.alphanumeric(8).toUpperCase(),
    barcode: randomBoolean(0.8) ? faker.string.numeric(13) : undefined,
    qrCode: randomBoolean(0.5) ? faker.string.alphanumeric(20) : undefined,
    name: fullName,
    slug: faker.helpers.slugify(fullName).toLowerCase(),
    description: randomArrayItem(PRODUCT_DESCRIPTIONS),
    shortDescription: faker.lorem.sentence(),
    type: randomArrayItem(['simple', 'variable', 'digital', 'downloadable']),
    status: randomArrayItem<ProductStatus>(['active', 'active', 'active', 'draft', 'inactive']),
    visibility: randomArrayItem(['visible', 'visible', 'visible', 'hidden']),
    categories: [category.id],
    tags: Array.from({ length: randomInt(1, 5) }, () => faker.commerce.productAdjective()),
    brand,
    images: Array.from({ length: randomInt(1, 5) }, (_, i) => ({
      id: generateId('img'),
      url: faker.image.url(),
      thumbnail: faker.image.url(),
      alt: fullName,
      isPrimary: i === 0,
      sortOrder: i
    })),
    pricing: {
      price,
      compareAtPrice: randomBoolean(0.3) ? price * 1.2 : undefined,
      cost,
      profit: price - cost,
      margin: ((price - cost) / price) * 100,
      currency: 'USD',
      taxIncluded: false
    },
    inventory: {
      sku: faker.string.alphanumeric(8).toUpperCase(),
      quantity,
      reserved: randomInt(0, 5),
      available: quantity - randomInt(0, 5),
      backorderable: randomBoolean(0.1),
      preorderable: randomBoolean(0.05),
      lowStockThreshold: 10,
      outOfStockThreshold: 0,
      trackQuantity: true,
      allowBackorders: randomBoolean(0.1),
      minOrderQuantity: 1,
      maxOrderQuantity: randomBoolean(0.5) ? randomInt(5, 20) : undefined,
      inventoryHistory: [],
      stockStatus: quantity === 0 ? 'out_of_stock' : quantity < 10 ? 'low_stock' : 'in_stock'
    },
    variants: [],
    attributes: [],
    shipping: {
      weight: randomFloat(0.1, 10),
      weightUnit: 'kg',
      dimensions: {
        length: randomFloat(5, 50),
        width: randomFloat(5, 30),
        height: randomFloat(1, 20),
        unit: 'cm'
      },
      flatRate: randomBoolean(0.3) ? randomFloat(5, 20) : undefined,
      freeShipping: randomBoolean(0.1)
    },
    seo: {
      title: `Buy ${fullName} Online`,
      description: faker.lorem.paragraph(),
      keywords: [fullName, category.name, brand.name],
      noIndex: false,
      noFollow: false
    },
    metadata: {
      views: randomInt(0, 10000)
    },
    ratings: {
      average: randomFloat(3, 5, 1),
      count: randomInt(0, 100),
      distribution: {
        1: randomInt(0, 5),
        2: randomInt(0, 5),
        3: randomInt(0, 10),
        4: randomInt(5, 20),
        5: randomInt(10, 50)
      }
    },
    reviews: [],
    relatedProducts: [],
    upsellProducts: [],
    crossSellProducts: [],
    createdAt: subMonths(new Date(), randomInt(1, 12)),
    updatedAt: new Date(),
    publishedAt: randomBoolean(0.8) ? subDays(new Date(), randomInt(1, 30)) : undefined
  };
};

// ============================================================================
// CUSTOMER GENERATOR
// ============================================================================

export const generateCustomer = (storeId: string): Customer => {
  const id = generateId('cust');
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const createdAt = subMonths(new Date(), randomInt(1, 24));
  const totalOrders = randomInt(1, 20);
  const totalSpent = randomFloat(100, 5000);
  
  return {
    id,
    storeId,
    email: generateEmail(firstName, lastName),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    phone: generatePhone(),
    avatar: faker.image.avatar(),
    dateOfBirth: randomBoolean(0.7) ? faker.date.birthdate() : undefined,
    gender: randomArrayItem(['male', 'female', 'other']),
    addresses: Array.from({ length: randomInt(1, 3) }, (_, i) => ({
      ...generateAddress('US'),
      id: generateId('addr'),
      isDefault: i === 0
    })),
    groups: [],
    tags: randomArraySlice(['vip', 'repeat', 'new', 'at-risk', 'high-value'], 0, 3),
    notes: [],
    segments: [],
    metadata: {},
    stats: {
      totalOrders,
      totalSpent,
      averageOrderValue: totalSpent / totalOrders,
      firstOrderDate: subDays(createdAt, randomInt(1, 30)),
      lastOrderDate: subDays(new Date(), randomInt(1, 60)),
      lastActiveDate: subDays(new Date(), randomInt(0, 30)),
      lifetimeValue: totalSpent,
      predictedLTV: totalSpent * 1.5,
      churnProbability: randomFloat(0, 0.3),
      reviewCount: randomInt(0, 5),
      averageRating: randomFloat(3, 5, 1),
      refundCount: randomInt(0, 2),
      refundTotal: randomFloat(0, 100),
      returnCount: randomInt(0, 2)
    },
    preferences: {
      newsletter: randomBoolean(0.7),
      marketingEmails: randomBoolean(0.5),
      smsNotifications: randomBoolean(0.3),
      pushNotifications: randomBoolean(0.4),
      priceAlerts: randomBoolean(0.6),
      stockAlerts: randomBoolean(0.8),
      reviewReminders: randomBoolean(0.5),
      birthdayReminders: randomBoolean(0.4),
      preferredCategories: [],
      preferredBrands: []
    },
    communications: {
      email: randomBoolean(0.9),
      sms: randomBoolean(0.4),
      push: randomBoolean(0.5),
      whatsapp: randomBoolean(0.1),
      messenger: randomBoolean(0.1),
      marketing: randomBoolean(0.5),
      transactional: true,
      abandonedCart: true,
      orderUpdates: true,
      productUpdates: randomBoolean(0.6),
      frequency: randomArrayItem(['immediate', 'daily', 'weekly']),
      timezone: 'America/New_York'
    },
    loyalty: {
      points: randomInt(0, 1000),
      tier: randomArrayItem(['bronze', 'silver', 'gold', 'platinum']),
      pointsEarned: randomInt(100, 5000),
      pointsRedeemed: randomInt(0, 1000),
      pointsExpiring: randomInt(0, 500),
      referralCode: faker.string.alphanumeric(8).toUpperCase(),
      referrals: randomInt(0, 10),
      rewards: []
    },
    subscriptions: [],
    wishlist: [],
    recentlyViewed: [],
    paymentMethods: [],
    createdAt,
    updatedAt: new Date(),
    lastLoginAt: randomBoolean(0.8) ? subDays(new Date(), randomInt(0, 30)) : undefined,
    lastPurchaseAt: randomBoolean(0.7) ? subDays(new Date(), randomInt(0, 60)) : undefined,
    status: randomArrayItem<CustomerStatus>(['active', 'active', 'active', 'inactive', 'blocked']),
    verified: randomBoolean(0.9),
    twoFactorEnabled: randomBoolean(0.1)
  };
};

// ============================================================================
// ORDER GENERATOR (FIXED VERSION)
// ============================================================================

export const generateOrder = (
  storeId: string,
  customers: Customer[],
  products: Product[]
): Order => {
  const id = generateId('ord');
  const customer = randomArrayItem(customers);
  const itemCount = randomInt(1, 5);
  const items = Array.from({ length: itemCount }, () => {
    const product = randomArrayItem(products);
    const quantity = randomInt(1, 3);
    return {
      id: generateId('item'),
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity,
      price: product.pricing.price,
      total: product.pricing.price * quantity,
      tax: product.pricing.price * quantity * 0.1,
      taxRate: 0.1,
      discount: 0,
      discountTotal: 0,
      image: product.images[0]?.url,
      weight: product.shipping.weight,
      weightUnit: product.shipping.weightUnit,
      dimensions: product.shipping.dimensions,
      isDigital: product.type === 'digital',
      isGift: randomBoolean(0.1)
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shippingTotal = randomFloat(0, 20);
  const taxTotal = subtotal * 0.1;
  const discountTotal = randomBoolean(0.3) ? randomFloat(5, 20) : 0;
  const total = subtotal + shippingTotal + taxTotal - discountTotal;

  const statuses: OrderStatus[] = ['pending', 'processing', 'confirmed', 'completed', 'cancelled'];
  const status = randomArrayItem(statuses);
  
  const now = new Date();
  const createdAt = subDays(now, randomInt(1, 30));
  
  return {
    id,
    storeId,
    orderNumber: `ORD-${faker.string.numeric(5)}`,
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.fullName,
      phone: customer.phone
    },
    items,
    subtotal,
    shippingTotal,
    taxTotal,
    discountTotal,
    total,
    currency: 'USD',
    status,
    paymentStatus: randomArrayItem<PaymentStatus>(['paid', 'paid', 'paid', 'pending', 'failed']),
    fulfillmentStatus: randomArrayItem<FulfillmentStatus>(['unfulfilled', 'fulfilled', 'shipped', 'delivered']),
    paymentMethod: randomArrayItem(['credit_card', 'paypal', 'bank_transfer']),
    shippingMethod: {
      id: generateId('ship'),
      name: randomArrayItem(['Standard Shipping', 'Express Shipping', 'Overnight']),
      code: randomArrayItem(['std', 'exp', 'ovn']),
      carrier: randomArrayItem(['UPS', 'FedEx', 'USPS']),
      service: 'ground',
      rate: shippingTotal,
      currency: 'USD',
      zones: ['US'],
      estimatedDays: [2, 5]
    },
    billingAddress: customer.addresses[0],
    shippingAddress: customer.addresses[0],
    createdAt,
    updatedAt: status === 'completed' ? addDays(createdAt, randomInt(1, 5)) : now,
    processedAt: status !== 'pending' ? addDays(createdAt, randomInt(0, 2)) : undefined,
    fulfilledAt: status === 'shipped' || status === 'delivered' ? addDays(createdAt, randomInt(2, 5)) : undefined,
    cancelledAt: status === 'cancelled' ? addDays(createdAt, randomInt(1, 3)) : undefined,
    notes: randomBoolean(0.3) ? [{
      id: generateId('note'),
      content: faker.lorem.sentence(),
      type: 'private',
      createdBy: 'system',
      createdAt: addDays(createdAt, randomInt(0, 2))
    }] : [],
    tags: randomBoolean(0.2) ? ['gift', 'priority'] : [],
    tracking: status === 'shipped' || status === 'delivered' ? [{
      id: generateId('track'),
      carrier: randomArrayItem(['UPS', 'FedEx', 'USPS']),
      trackingNumber: faker.string.alphanumeric(12).toUpperCase(),
      trackingUrl: 'https://example.com/track',
      status: randomArrayItem(['in_transit', 'out_for_delivery', 'delivered']),
      estimatedDelivery: addDays(createdAt, 5),
      deliveredAt: status === 'delivered' ? addDays(createdAt, randomInt(3, 7)) : undefined,
      events: []
    }] : [],
    metadata: {
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      device: {
        type: randomArrayItem(['mobile', 'desktop', 'tablet']),
        brand: randomArrayItem(['Apple', 'Samsung', 'Google']),
        os: randomArrayItem(['iOS', 'Android', 'Windows', 'macOS']),
        browser: randomArrayItem(['Chrome', 'Safari', 'Firefox']),
        isMobile: randomBoolean(0.5),
        isTablet: randomBoolean(0.1),
        isDesktop: randomBoolean(0.4),
        isBot: false
      }
    },
    source: randomArrayItem(['website', 'mobile_app', 'social']),
    channel: randomArrayItem(['direct', 'search', 'social']),
    fraudScore: randomInt(0, 30),
    riskLevel: 'low',
    isGift: randomBoolean(0.1),
    giftMessage: randomBoolean(0.1) ? faker.lorem.sentence() : undefined
  };
};

// ============================================================================
// REVIEW GENERATOR
// ============================================================================

export const generateReview = (
  productId: string,
  customerId: string,
  orderId?: string
): Review => {
  const rating = randomInt(3, 5);
  
  return {
    id: generateId('rev'),
    productId,
    customerId,
    orderId,
    rating,
    title: randomArrayItem(REVIEW_TITLES),
    content: randomArrayItem(REVIEW_CONTENTS),
    pros: randomBoolean(0.3) ? [faker.lorem.word(), faker.lorem.word()] : undefined,
    cons: randomBoolean(0.2) ? [faker.lorem.word()] : undefined,
    images: randomBoolean(0.2) ? [faker.image.url(), faker.image.url()] : undefined,
    verified: randomBoolean(0.8),
    helpful: randomInt(0, 20),
    unhelpful: randomInt(0, 5),
    reported: randomBoolean(0.05),
    status: randomArrayItem(['approved', 'approved', 'approved', 'pending']),
    createdAt: subDays(new Date(), randomInt(1, 60)),
    updatedAt: new Date()
  };
};

// ============================================================================
// DISCOUNT GENERATOR (FIXED VERSION)
// ============================================================================

export const generateDiscount = (): Discount => {
  const id = generateId('disc');
  const type = randomArrayItem(['percentage', 'fixed', 'free_shipping']) as 'percentage' | 'fixed' | 'free_shipping';
  const now = new Date();
  
  return {
    id,
    code: faker.string.alphanumeric(8).toUpperCase(),
    type,
    value: type === 'percentage' ? randomInt(5, 30) : randomFloat(5, 50),
    minPurchase: randomBoolean(0.5) ? randomFloat(20, 100) : undefined,
    maxDiscount: type === 'percentage' && randomBoolean(0.3) ? randomFloat(20, 50) : undefined,
    startDate: now,
    endDate: addDays(now, randomInt(7, 90)),
    usageLimit: randomBoolean(0.7) ? randomInt(50, 500) : undefined,
    usageCount: randomInt(0, 50),
    perCustomerLimit: randomBoolean(0.5) ? 1 : undefined,
    isActive: randomBoolean(0.8),
    createdAt: now,
    createdBy: 'user_123'
  };
};

// ============================================================================
// CAMPAIGN GENERATOR
// ============================================================================

export const generateCampaign = (): Campaign => {
  const id = generateId('camp');
  const now = new Date();
  
  return {
    id,
    name: `${randomArrayItem(['Summer', 'Winter', 'Spring', 'Fall'])} ${randomArrayItem(['Sale', 'Promo', 'Campaign'])} ${now.getFullYear()}`,
    description: faker.lorem.sentence(),
    type: randomArrayItem(['email', 'social', 'search']),
    status: randomArrayItem(['draft', 'active', 'completed']),
    audience: {
      segments: [],
      conditions: [],
      size: randomInt(1000, 10000)
    },
    content: {
      subject: faker.lorem.sentence(),
      preview: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(3),
      cta: {
        text: 'Shop Now',
        url: 'https://example.com/shop'
      }
    },
    schedule: {
      startDate: now,
      endDate: addDays(now, randomInt(7, 30)),
      timezone: 'America/New_York'
    },
    budget: {
      total: randomFloat(500, 5000),
      spent: randomFloat(0, 2000),
      remaining: randomFloat(300, 5000),
      currency: 'USD'
    },
    tracking: {
      utmSource: randomArrayItem(['facebook', 'google', 'instagram']),
      utmMedium: randomArrayItem(['cpc', 'email', 'social']),
      utmCampaign: faker.helpers.slugify(id).toLowerCase()
    },
    stats: {
      sent: randomInt(1000, 10000),
      delivered: randomInt(900, 9500),
      opened: randomInt(200, 3000),
      clicked: randomInt(50, 500),
      converted: randomInt(10, 100),
      bounced: randomInt(10, 100),
      unsubscribed: randomInt(5, 50),
      complained: randomInt(0, 10),
      revenue: randomFloat(500, 10000),
      roi: randomFloat(1, 5),
      ctr: randomFloat(1, 10),
      conversionRate: randomFloat(1, 5)
    },
    createdAt: subDays(now, randomInt(1, 30)),
    updatedAt: now,
    createdBy: 'user_123'
  };
};

// ============================================================================
// TICKET GENERATOR
// ============================================================================

export const generateTicket = (customerId: string): Ticket => {
  const id = generateId('ticket');
  const now = new Date();
  
  return {
    id,
    customerId,
    subject: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: randomArrayItem(['open', 'in_progress', 'resolved', 'closed']),
    priority: randomArrayItem(['low', 'medium', 'high']),
    category: randomArrayItem(['billing', 'technical', 'product', 'shipping']),
    messages: [
      {
        id: generateId('msg'),
        content: faker.lorem.paragraph(),
        type: 'customer',
        createdAt: subDays(now, randomInt(1, 3))
      }
    ],
    tags: randomArraySlice(['urgent', 'refund', 'return'], 0, 2),
    metadata: {},
    createdAt: subDays(now, randomInt(1, 7)),
    updatedAt: now
  };
};

// ============================================================================
// ANALYTICS DATA GENERATOR (FIXED VERSION)
// ============================================================================

export const generateAnalyticsData = (
  days: number = 30,
  orders: Order[]
): AnalyticsData => {
  const now = new Date();
  const start = subDays(now, days);
  
  // Generate daily data (used for internal calculations)
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = subDays(now, days - 1 - i);
    const dayOrders = orders.filter(o => 
      o.createdAt.toDateString() === date.toDateString()
    );
    
    return {
      date: date.toISOString().split('T')[0],
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
      customers: new Set(dayOrders.map(o => o.customer.id)).size,
      aov: dayOrders.length ? dayOrders.reduce((sum, o) => sum + o.total, 0) / dayOrders.length : 0
    };
  });

  // Calculate totals from dailyData
  const totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = dailyData.reduce((sum, d) => sum + d.orders, 0);
  const totalCustomers = dailyData.reduce((sum, d) => sum + d.customers, 0);
  const totalProducts = orders.reduce((sum, o) => sum + o.items.length, 0);

  return {
    dateRange: {
      start,
      end: now,
      label: `Last ${days} days`
    },
    metrics: {
      revenue: {
        value: totalRevenue,
        previousValue: totalRevenue * 0.8,
        change: 23.5,
        trend: 'up',
        format: 'currency',
        label: 'Total Revenue'
      },
      orders: {
        value: totalOrders,
        previousValue: totalOrders * 0.85,
        change: 12.3,
        trend: 'up',
        format: 'number',
        label: 'Total Orders'
      },
      customers: {
        value: totalCustomers,
        previousValue: totalCustomers * 0.82,
        change: 18.2,
        trend: 'up',
        format: 'number',
        label: 'Customers'
      },
      products: {
        value: totalProducts,
        previousValue: totalProducts * 0.9,
        change: 8.7,
        trend: 'up',
        format: 'number',
        label: 'Products Sold'
      },
      conversion: {
        value: 3.2,
        previousValue: 2.9,
        change: 10.3,
        trend: 'up',
        format: 'percentage',
        label: 'Conversion Rate'
      },
      aov: {
        value: totalOrders ? totalRevenue / totalOrders : 0,
        previousValue: 0,
        change: 5.6,
        trend: 'up',
        format: 'currency',
        label: 'Avg Order Value'
      },
      refunds: {
        value: 0,
        previousValue: 0,
        change: 0,
        trend: 'stable',
        format: 'currency',
        label: 'Refunds'
      },
      returns: {
        value: 0,
        previousValue: 0,
        change: 0,
        trend: 'stable',
        format: 'number',
        label: 'Returns'
      },
      traffic: {
        value: randomInt(10000, 50000),
        previousValue: randomInt(8000, 40000),
        change: 15.4,
        trend: 'up',
        format: 'number',
        label: 'Traffic'
      },
      sessions: {
        value: randomInt(8000, 40000),
        previousValue: randomInt(6000, 35000),
        change: 12.8,
        trend: 'up',
        format: 'number',
        label: 'Sessions'
      },
      pageviews: {
        value: randomInt(20000, 100000),
        previousValue: randomInt(15000, 90000),
        change: 22.1,
        trend: 'up',
        format: 'number',
        label: 'Pageviews'
      },
      bounceRate: {
        value: randomFloat(35, 55),
        previousValue: randomFloat(38, 58),
        change: -2.3,
        trend: 'down',
        format: 'percentage',
        label: 'Bounce Rate'
      },
      custom: {}
    },
    dimensions: [],
    segments: [],
    comparisons: [],
    filters: [],
    sort: [],
    limit: 100,
    offset: 0
  };
};

// ============================================================================
// MASTER DATA GENERATOR
// ============================================================================

export const generateMockData = () => {
  console.log('🚀 Generating mock data...');
  
  // Generate stores
  const stores = Array.from({ length: MOCK_CONFIG.storeCount }, generateStore);
  const storeIds = stores.map(s => s.id);
  
  // Generate users
  const users = storeIds.flatMap(storeId => 
    Array.from({ length: 3 }, () => generateUser(storeId))
  );
  
  // Generate categories (with hierarchy)
  const topLevelCategories = Array.from(
    { length: MOCK_CONFIG.categoryCount / 2 },
    () => generateCategory()
  );
  
  const subCategories = topLevelCategories.flatMap(parent => 
    Array.from({ length: 2 }, () => generateCategory(parent.id))
  );
  
  const categories = [...topLevelCategories, ...subCategories];
  
  // Generate brands
  const brands = Array.from({ length: MOCK_CONFIG.brandCount }, generateBrand);
  
  // Generate products
  const products = storeIds.flatMap(storeId => 
    Array.from(
      { length: MOCK_CONFIG.productCount / storeIds.length },
      () => generateProduct(storeId, categories, brands)
    )
  );
  
  // Generate customers
  const customers = storeIds.flatMap(storeId => 
    Array.from(
      { length: MOCK_CONFIG.customerCount / storeIds.length },
      () => generateCustomer(storeId)
    )
  );
  
  // Generate orders
  const orders = storeIds.flatMap(storeId => 
    Array.from(
      { length: MOCK_CONFIG.orderCount / storeIds.length },
      () => generateOrder(storeId, customers, products)
    )
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Generate reviews
  const reviews = products.flatMap(product => 
    Array.from(
      { length: randomInt(0, 5) },
      () => generateReview(
        product.id,
        randomArrayItem(customers).id,
        randomArrayItem(orders.filter(o => o.items.some(i => i.productId === product.id)))?.id
      )
    )
  );
  
  // Generate discounts
  const discounts = Array.from({ length: MOCK_CONFIG.discountCount }, generateDiscount);
  
  // Generate campaigns
  const campaigns = Array.from({ length: MOCK_CONFIG.campaignCount }, generateCampaign);
  
  // Generate tickets
  const tickets = customers.flatMap(customer => 
    Array.from(
      { length: randomInt(0, 2) },
      () => generateTicket(customer.id)
    )
  );
  
  // Generate analytics
  const analytics = generateAnalyticsData(30, orders);
  
  console.log('✅ Mock data generated successfully!');
  console.log(`📊 ${stores.length} stores`);
  console.log(`📦 ${products.length} products`);
  console.log(`👥 ${customers.length} customers`);
  console.log(`🛍️ ${orders.length} orders`);
  console.log(`⭐ ${reviews.length} reviews`);
  
  return {
    stores,
    users,
    categories,
    brands,
    products,
    customers,
    orders,
    reviews,
    discounts,
    campaigns,
    tickets,
    analytics
  };
};

// ============================================================================
// EXPORT DEFAULT DATA
// ============================================================================

export default generateMockData;
