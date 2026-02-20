import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// USER STORE
// ============================================================================

interface UserState {
  id: string | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  role: string | null;
  permissions: string[];
  preferences: Record<string, any>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserState>) => void;
  updatePreferences: (prefs: Record<string, any>) => void;
}

const initialUserState: UserState = {
  id: null,
  email: null,
  name: null,
  avatar: null,
  role: null,
  permissions: [],
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: true
  },
  isAuthenticated: false,
  isLoading: false,
  error: null
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialUserState,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (email === 'demo@nova.com' && password === 'demo123') {
            set({
              id: 'user_123',
              email,
              name: 'John Doe',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
              role: 'admin',
              permissions: ['all'],
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed' 
          });
          throw error;
        }
      },
      
      logout: () => {
        set(initialUserState);
      },
      
      updateProfile: (data: Partial<UserState>) => {
        set((state) => ({ ...state, ...data }));
      },
      
      updatePreferences: (prefs: Record<string, any>) => {
        set((state) => ({ 
          preferences: { ...state.preferences, ...prefs } 
        }));
      }
    }),
    {
      name: 'nova-user'
    }
  )
);

// ============================================================================
// PRODUCT STORE
// ============================================================================

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  images: string[];
  rating: number;
  reviews: number;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  filters: {
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    inStock: boolean;
    search: string;
  };
  sort: {
    field: keyof Product | null;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface ProductActions {
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  setSort: (field: keyof Product, direction: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  clearSelected: () => void;
}

const initialProductState: ProductState = {
  products: [],
  selectedProduct: null,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    inStock: false,
    search: ''
  },
  sort: {
    field: null,
    direction: 'asc'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null
};

export const useProductStore = create<ProductState & ProductActions>()(
  persist(
    (set, get) => ({
      ...initialProductState,
      
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
            id: `prod_${i + 1}`,
            name: `Product ${i + 1}`,
            price: Math.random() * 1000,
            description: `Description for product ${i + 1}`,
            category: ['Electronics', 'Fashion', 'Home'][Math.floor(Math.random() * 3)],
            stock: Math.floor(Math.random() * 100),
            images: [`https://picsum.photos/200/200?random=${i + 1}`],
            rating: 3 + Math.random() * 2,
            reviews: Math.floor(Math.random() * 100)
          }));
          
          const state = get();
          const { filters, sort, pagination } = state;
          
          // Apply filters
          let filtered = [...mockProducts];
          if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
          }
          if (filters.minPrice !== null) {
            filtered = filtered.filter(p => p.price >= filters.minPrice!);
          }
          if (filters.maxPrice !== null) {
            filtered = filtered.filter(p => p.price <= filters.maxPrice!);
          }
          if (filters.inStock) {
            filtered = filtered.filter(p => p.stock > 0);
          }
          if (filters.search) {
            filtered = filtered.filter(p => 
              p.name.toLowerCase().includes(filters.search!.toLowerCase())
            );
          }
          
          // Apply sorting
          if (sort.field) {
            filtered.sort((a, b) => {
              const aVal = a[sort.field as keyof Product];
              const bVal = b[sort.field as keyof Product];
              if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
              }
              if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sort.direction === 'asc' 
                  ? aVal.localeCompare(bVal) 
                  : bVal.localeCompare(aVal);
              }
              return 0;
            });
          }
          
          // Apply pagination
          const start = (pagination.page - 1) * pagination.limit;
          const paginated = filtered.slice(start, start + pagination.limit);
          
          set({
            products: paginated,
            pagination: {
              ...pagination,
              total: filtered.length,
              totalPages: Math.ceil(filtered.length / pagination.limit)
            },
            isLoading: false
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch products' 
          });
        }
      },
      
      fetchProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const product: Product = {
            id,
            name: `Product ${id}`,
            price: 299.99,
            description: 'High-quality product with premium features.',
            category: 'Electronics',
            stock: 45,
            images: ['https://picsum.photos/400/400?random=1'],
            rating: 4.5,
            reviews: 128
          };
          
          set({ selectedProduct: product, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch product' 
          });
        }
      },
      
      createProduct: async (product: Omit<Product, 'id'>) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newProduct: Product = {
            ...product,
            id: `prod_${Date.now()}`
          };
          
          set((state) => ({ 
            products: [newProduct, ...state.products],
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to create product' 
          });
          throw error;
        }
      },
      
      updateProduct: async (id: string, product: Partial<Product>) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set((state) => ({
            products: state.products.map(p =>
              p.id === id ? { ...p, ...product } : p
            ),
            selectedProduct: state.selectedProduct?.id === id 
              ? { ...state.selectedProduct, ...product } 
              : state.selectedProduct,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update product' 
          });
          throw error;
        }
      },
      
      deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set((state) => ({
            products: state.products.filter(p => p.id !== id),
            selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete product' 
          });
          throw error;
        }
      },
      
      setFilters: (filters: Partial<ProductState['filters']>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 }
        }));
        get().fetchProducts();
      },
      
      setSort: (field: keyof Product, direction: 'asc' | 'desc') => {
        set({ sort: { field, direction } });
        get().fetchProducts();
      },
      
      setPage: (page: number) => {
        set((state) => ({ 
          pagination: { ...state.pagination, page } 
        }));
        get().fetchProducts();
      },
      
      clearSelected: () => {
        set({ selectedProduct: null });
      }
    }),
    {
      name: 'nova-products'
    }
  )
);

// ============================================================================
// CART STORE
// ============================================================================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string | null;
  couponDiscount: number;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  calculateTotals: () => void;
}

const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  couponCode: null,
  couponDiscount: 0,
  isLoading: false,
  error: null
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      ...initialCartState,
      
      addItem: (item: Omit<CartItem, 'id'>) => {
        set((state) => {
          const existingItem = state.items.find(i => i.productId === item.productId);
          
          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (newQuantity <= item.maxQuantity) {
              existingItem.quantity = newQuantity;
            }
          } else {
            state.items.push({
              ...item,
              id: uuidv4()
            });
          }
          
          return { items: [...state.items] };
        });
        get().calculateTotals();
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId)
        }));
        get().calculateTotals();
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          const item = state.items.find(i => i.productId === productId);
          if (item) {
            item.quantity = Math.min(Math.max(1, quantity), item.maxQuantity);
          }
          return { items: [...state.items] };
        });
        get().calculateTotals();
      },
      
      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          couponDiscount: 0
        });
        get().calculateTotals();
      },
      
      applyCoupon: async (code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const validCoupons: Record<string, number> = {
            'SAVE10': 10,
            'SAVE20': 20,
            'FREESHIP': 0
          };
          
          if (code in validCoupons) {
            set({ 
              couponCode: code, 
              couponDiscount: validCoupons[code],
              isLoading: false 
            });
            get().calculateTotals();
          } else {
            throw new Error('Invalid coupon code');
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to apply coupon' 
          });
        }
      },
      
      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0 });
        get().calculateTotals();
      },
      
      calculateTotals: () => {
        set((state) => {
          const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const discount = state.couponDiscount
            ? (subtotal * state.couponDiscount / 100)
            : 0;
          const tax = (subtotal - discount) * 0.1;
          const shipping = subtotal > 100 ? 0 : 10;
          
          return {
            subtotal,
            discount,
            tax,
            shipping,
            total: subtotal - discount + tax + shipping
          };
        });
      }
    }),
    {
      name: 'nova-cart'
    }
  )
);

// ============================================================================
// UI STORE
// ============================================================================

interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  sidebarWidth: number;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    createdAt: Date;
  }>;
  modals: Record<string, boolean>;
  loading: Record<string, boolean>;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration: number;
  }>;
}

interface UIActions {
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  setLoading: (key: string, isLoading: boolean) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

const initialUIState: UIState = {
  theme: 'dark',
  sidebarOpen: true,
  sidebarWidth: 280,
  notifications: [],
  modals: {},
  loading: {},
  toasts: []
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      ...initialUIState,
      
      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }));
      },
      
      setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },
      
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },
      
      setSidebarWidth: (width: number) => {
        set({ sidebarWidth: width });
      },
      
      addNotification: (notification) => {
        const id = uuidv4();
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id,
              createdAt: new Date()
            }
          ]
        }));
        
        if (notification.duration) {
          setTimeout(() => {
            const current = get();
            const notif = current.notifications.find(n => n.id === id);
            if (notif) {
              current.removeNotification(id);
            }
          }, notification.duration);
        }
      },
      
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
      
      openModal: (modalId: string) => {
        set((state) => ({ 
          modals: { ...state.modals, [modalId]: true } 
        }));
      },
      
      closeModal: (modalId: string) => {
        set((state) => ({ 
          modals: { ...state.modals, [modalId]: false } 
        }));
      },
      
      toggleModal: (modalId: string) => {
        set((state) => ({ 
          modals: { ...state.modals, [modalId]: !state.modals[modalId] } 
        }));
      },
      
      setLoading: (key: string, isLoading: boolean) => {
        set((state) => ({ 
          loading: { ...state.loading, [key]: isLoading } 
        }));
      },
      
      addToast: (toast) => {
        const id = uuidv4();
        set((state) => ({
          toasts: [
            ...state.toasts,
            { ...toast, id }
          ]
        }));
        
        setTimeout(() => {
          const current = get();
          current.removeToast(id);
        }, toast.duration || 3000);
      },
      
      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      }
    }),
    {
      name: 'nova-ui'
    }
  )
);

// ============================================================================
// EXPORT STORES
// ============================================================================

export const stores = {
  user: useUserStore,
  products: useProductStore,
  cart: useCartStore,
  ui: useUIStore
};

export default stores;
