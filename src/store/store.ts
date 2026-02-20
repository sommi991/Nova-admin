import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { enableMapSet } from 'immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';

// Enable Map and Set support for Immer
enableMapSet();

// ============================================================================
// TYPES
// ============================================================================

export type StoreState<T> = T;
export type StoreActions<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : never;
};

export interface StoreWithActions<TState, TActions> {
  use: UseBoundStore<StoreApi<TState & TActions>>;
  get: () => TState & TActions;
  set: (fn: (state: TState & TActions) => void) => void;
  subscribe: (selector: (state: TState & TActions) => any, callback: (value: any) => void) => () => void;
  reset: () => void;
  actions: TActions;
}

export interface StoreConfig<TState, TActions> {
  name: string;
  initialState: TState;
  actions: (set: any, get: any, api: any) => TActions;
  persist?: boolean;
  persistKey?: string;
  devtools?: boolean;
  middleware?: any[];
  onInit?: (store: StoreWithActions<TState, TActions>) => void;
  onDestroy?: () => void;
}

export interface StoreMiddleware<TState = any, TActions = any> {
  (config: StoreConfig<TState, TActions>): StoreConfig<TState, TActions>;
}

// ============================================================================
// STORE FACTORY
// ============================================================================

export function createStore<TState extends object, TActions extends object>(
  config: StoreConfig<TState, TActions>
): StoreWithActions<TState, TActions> {
  const {
    name,
    initialState,
    actions: actionCreators,
    persist: shouldPersist = false,
    persistKey = name,
    devtools: enableDevtools = process.env.NODE_ENV === 'development',
    middleware = [],
    onInit,
    onDestroy
  } = config;

  // Apply middleware
  let finalConfig = { ...config };
  middleware.forEach(mw => {
    finalConfig = mw(finalConfig);
  });

  // Create store with middleware
  let storeCreator: any = (set: any, get: any, api: any) => ({
    ...initialState,
    ...actionCreators(set, get, api)
  });

  // Add devtools
  if (enableDevtools) {
    storeCreator = devtools(storeCreator, { name, enabled: enableDevtools });
  }

  // Add persistence
  if (shouldPersist) {
    storeCreator = persist(storeCreator, {
      name: persistKey,
      storage: createJSONStorage(() => {
        // Use appropriate storage based on environment
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return AsyncStorage;
      }),
      partialize: (state: any) => {
        // Don't persist actions, only state
        const { ...stateOnly } = state;
        Object.keys(actionCreators({} as any, {} as any, {} as any)).forEach(
          key => delete stateOnly[key]
        );
        return stateOnly;
      }
    });
  }

  // Add Immer for immutable updates
  storeCreator = immer(storeCreator);

  // Create the store
  const useStore = create<TState & TActions>(storeCreator);

  // Get store API
  const storeApi = useStore as StoreApi<TState & TActions>;

  // Create store wrapper
  const store: StoreWithActions<TState, TActions> = {
    use: useStore,
    get: () => storeApi.getState(),
    set: (fn: (state: TState & TActions) => void) => {
      storeApi.setState(produce(storeApi.getState(), fn));
    },
    subscribe: (selector, callback) => {
      return storeApi.subscribe(selector, callback);
    },
    reset: () => {
      storeApi.setState(initialState as any);
    },
    actions: actionCreators(storeApi.setState, storeApi.getState, storeApi) as TActions
  };

  // Call onInit if provided
  if (onInit) {
    onInit(store);
  }

  // Setup cleanup on unmount (if in React)
  if (typeof window !== 'undefined' && onDestroy) {
    window.addEventListener('beforeunload', onDestroy);
  }

  return store;
}

// ============================================================================
// HOOKS
// ============================================================================

export function useStore<TState, TSelected>(
  store: StoreWithActions<TState, any>,
  selector: (state: TState) => TSelected,
  equalityFn: (a: TSelected, b: TSelected) => boolean = shallow
): TSelected {
  return store.use(selector, equalityFn);
}

export function useStoreActions<TState, TActions>(
  store: StoreWithActions<TState, TActions>
): TActions {
  return store.use((state) => {
    const actions = {} as TActions;
    Object.keys(store.actions).forEach((key) => {
      actions[key as keyof TActions] = state[key as keyof typeof state] as any;
    });
    return actions;
  });
}

export function useStoreState<TState, TSelected>(
  store: StoreWithActions<TState, any>,
  selector: (state: TState) => TSelected,
  deps: any[] = []
): TSelected {
  return store.use(
    (state) => selector(state),
    (a, b) => {
      if (deps.length === 0) return shallow(a, b);
      return deps.every((dep, i) => dep === deps[i]);
    }
  );
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export const logger: StoreMiddleware = (config) => {
  return {
    ...config,
    actions: (set, get, api) => {
      const originalActions = config.actions(set, get, api);
      const loggedActions: any = {};

      Object.keys(originalActions).forEach(key => {
        loggedActions[key] = (...args: any[]) => {
          console.log(`[${config.name}] Action: ${key}`, args);
          const result = originalActions[key](...args);
          console.log(`[${config.name}] New State:`, get());
          return result;
        };
      });

      return loggedActions;
    }
  };
};

export const undoable = <TState extends object, TActions extends object>(
  maxHistory: number = 50
): StoreMiddleware<TState, TActions> => {
  return (config) => {
    const initialState = {
      ...config.initialState,
      _history: [] as TState[],
      _future: [] as TState[],
      _canUndo: false,
      _canRedo: false
    };

    return {
      ...config,
      initialState,
      actions: (set, get, api) => {
        const originalActions = config.actions(set, get, api);

        return {
          ...originalActions,
          undo: () => {
            const state = get();
            const history = state._history;
            const future = state._future;

            if (history.length > 0) {
              const previousState = history[history.length - 1];
              const newHistory = history.slice(0, -1);

              set((draft: any) => {
                Object.assign(draft, previousState);
                draft._history = newHistory;
                draft._future = [state, ...future].slice(0, maxHistory);
                draft._canUndo = newHistory.length > 0;
                draft._canRedo = true;
              });
            }
          },
          redo: () => {
            const state = get();
            const future = state._future;

            if (future.length > 0) {
              const nextState = future[0];
              const newFuture = future.slice(1);

              set((draft: any) => {
                Object.assign(draft, nextState);
                draft._history = [...state._history, state].slice(-maxHistory);
                draft._future = newFuture;
                draft._canUndo = true;
                draft._canRedo = newFuture.length > 0;
              });
            }
          },
          _saveToHistory: () => {
            const state = get();
            set((draft: any) => {
              draft._history = [...state._history, state].slice(-maxHistory);
              draft._future = [];
              draft._canUndo = true;
              draft._canRedo = false;
            });
          }
        };
      }
    };
  };
};

export const optimistic = <TState extends object, TActions extends object>(
  config: StoreConfig<TState, TActions>
): StoreConfig<TState, TActions> => {
  return {
    ...config,
    actions: (set, get, api) => {
      const originalActions = config.actions(set, get, api);
      const optimisticActions: any = {};

      Object.keys(originalActions).forEach(key => {
        const originalAction = originalActions[key];

        optimisticActions[key] = async (...args: any[]) => {
          const beforeState = get();

          // Apply optimistic update
          try {
            const result = await originalAction(...args);
            return result;
          } catch (error) {
            // Rollback on error
            set(() => beforeState);
            throw error;
          }
        };
      });

      return optimisticActions;
    }
  };
};

export const throttle = <TState extends object, TActions extends object>(
  delay: number = 300
): StoreMiddleware<TState, TActions> => {
  const pending: Set<string> = new Set();
  const timeouts: Map<string, NodeJS.Timeout> = new Map();

  return (config) => {
    return {
      ...config,
      actions: (set, get, api) => {
        const originalActions = config.actions(set, get, api);
        const throttledActions: any = {};

        Object.keys(originalActions).forEach(key => {
          throttledActions[key] = (...args: any[]) => {
            if (pending.has(key)) {
              // Clear existing timeout
              if (timeouts.has(key)) {
                clearTimeout(timeouts.get(key)!);
              }

              // Set new timeout
              timeouts.set(
                key,
                setTimeout(() => {
                  pending.delete(key);
                  timeouts.delete(key);
                  originalActions[key](...args);
                }, delay)
              );
              return;
            }

            pending.add(key);
            originalActions[key](...args);

            timeouts.set(
              key,
              setTimeout(() => {
                pending.delete(key);
                timeouts.delete(key);
              }, delay)
            );
          };
        });

        return throttledActions;
      }
    };
  };
};

export const debounce = <TState extends object, TActions extends object>(
  delay: number = 300
): StoreMiddleware<TState, TActions> => {
  const timeouts: Map<string, NodeJS.Timeout> = new Map();

  return (config) => {
    return {
      ...config,
      actions: (set, get, api) => {
        const originalActions = config.actions(set, get, api);
        const debouncedActions: any = {};

        Object.keys(originalActions).forEach(key => {
          debouncedActions[key] = (...args: any[]) => {
            if (timeouts.has(key)) {
              clearTimeout(timeouts.get(key)!);
            }

            timeouts.set(
              key,
              setTimeout(() => {
                timeouts.delete(key);
                originalActions[key](...args);
              }, delay)
            );
          };
        });

        return debouncedActions;
      }
    };
  };
};

export const cache = <TState extends object, TActions extends object>(
  ttl: number = 5 * 60 * 1000 // 5 minutes
): StoreMiddleware<TState, TActions> => {
  const cache = new Map<string, { value: any; expires: number }>();

  return (config) => {
    return {
      ...config,
      actions: (set, get, api) => {
        const originalActions = config.actions(set, get, api);
        const cachedActions: any = {};

        Object.keys(originalActions).forEach(key => {
          const originalAction = originalActions[key];

          cachedActions[key] = async (...args: any[]) => {
            const cacheKey = `${key}-${JSON.stringify(args)}`;
            const cached = cache.get(cacheKey);

            if (cached && cached.expires > Date.now()) {
              return cached.value;
            }

            const result = await originalAction(...args);

            cache.set(cacheKey, {
              value: result,
              expires: Date.now() + ttl
            });

            return result;
          };
        });

        return cachedActions;
      }
    };
  };
};

// ============================================================================
// STORE DEFINITIONS
// ============================================================================

// ==================== USER STORE ====================

export interface UserState {
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

export interface UserActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserState>) => void;
  updatePreferences: (prefs: Record<string, any>) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
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

export const useUserStore = createStore<UserState, UserActions>({
  name: 'user',
  initialState: initialUserState,
  persist: true,
  persistKey: 'nova-user',
  middleware: [logger],
  actions: (set, get) => ({
    login: async (email: string, password: string) => {
      set((state: UserState & UserActions) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === 'demo@nova.com' && password === 'demo123') {
          set((state: UserState & UserActions) => {
            state.id = 'user_123';
            state.email = email;
            state.name = 'John Doe';
            state.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop';
            state.role = 'admin';
            state.permissions = ['all'];
            state.isAuthenticated = true;
            state.isLoading = false;
          });
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        set((state: UserState & UserActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Login failed';
        });
        throw error;
      }
    },

    logout: () => {
      set((state: UserState & UserActions) => {
        Object.assign(state, initialUserState);
      });
    },

    updateProfile: (data: Partial<UserState>) => {
      set((state: UserState & UserActions) => {
        Object.assign(state, data);
      });
    },

    updatePreferences: (prefs: Record<string, any>) => {
      set((state: UserState & UserActions) => {
        state.preferences = { ...state.preferences, ...prefs };
      });
    },

    setError: (error: string | null) => {
      set((state: UserState & UserActions) => {
        state.error = error;
      });
    },

    clearError: () => {
      set((state: UserState & UserActions) => {
        state.error = null;
      });
    }
  })
});

// ==================== PRODUCT STORE ====================

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

export interface ProductState {
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

export interface ProductActions {
  fetchProducts: (params?: any) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductState['filters']>) => void;
  setSort: (field: keyof Product, direction: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  clearSelected: () => void;
  clearError: () => void;
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

export const useProductStore = createStore<ProductState, ProductActions>({
  name: 'products',
  initialState: initialProductState,
  persist: true,
  persistKey: 'nova-products',
  middleware: [logger, undoable(20), cache(300000)],
  actions: (set, get) => ({
    fetchProducts: async (params?: any) => {
      set((state: ProductState & ProductActions) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Simulate API call
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

        const { filters, sort, pagination } = get();
        
        // Apply filters
        let filtered = mockProducts;
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
            const aVal = a[sort.field!];
            const bVal = b[sort.field!];
            const modifier = sort.direction === 'asc' ? 1 : -1;
            return aVal > bVal ? modifier : -modifier;
          });
        }

        // Apply pagination
        const start = (pagination.page - 1) * pagination.limit;
        const paginated = filtered.slice(start, start + pagination.limit);

        set((state: ProductState & ProductActions) => {
          state.products = paginated;
          state.pagination.total = filtered.length;
          state.pagination.totalPages = Math.ceil(filtered.length / pagination.limit);
          state.isLoading = false;
        });
      } catch (error) {
        set((state: ProductState & ProductActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to fetch products';
        });
      }
    },

    fetchProduct: async (id: string) => {
      set((state: ProductState & ProductActions) => {
        state.isLoading = true;
        state.error = null;
      });

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

        set((state: ProductState & ProductActions) => {
          state.selectedProduct = product;
          state.isLoading = false;
        });
      } catch (error) {
        set((state: ProductState & ProductActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to fetch product';
        });
      }
    },

    createProduct: async (product: Omit<Product, 'id'>) => {
      set((state: ProductState & ProductActions) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newProduct: Product = {
          ...product,
          id: `prod_${Date.now()}`
        };

        set((state: ProductState & ProductActions) => {
          state.products = [newProduct, ...state.products];
          state.isLoading = false;
        });
      } catch (error) {
        set((state: ProductState & ProductActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to create product';
        });
        throw error;
      }
    },

    updateProduct: async (id: string, product: Partial<Product>) => {
      set((state: ProductState & ProductActions) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        set((state: ProductState & ProductActions) => {
          state.products = state.products.map(p =>
            p.id === id ? { ...p, ...product } : p
          );
          if (state.selectedProduct?.id === id) {
            state.selectedProduct = { ...state.selectedProduct, ...product };
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state: ProductState & ProductActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to update product';
        });
        throw error;
      }
    },

    deleteProduct: async (id: string) => {
      set((state: ProductState & ProductActions) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        set((state: ProductState & ProductActions) => {
          state.products = state.products.filter(p => p.id !== id);
          if (state.selectedProduct?.id === id) {
            state.selectedProduct = null;
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state: ProductState & ProductActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to delete product';
        });
        throw error;
      }
    },

    setFilters: (filters: Partial<ProductState['filters']>) => {
      set((state: ProductState & ProductActions) => {
        state.filters = { ...state.filters, ...filters };
        state.pagination.page = 1; // Reset to first page on filter change
      });
      get().fetchProducts();
    },

    setSort: (field: keyof Product, direction: 'asc' | 'desc') => {
      set((state: ProductState & ProductActions) => {
        state.sort = { field, direction };
      });
      get().fetchProducts();
    },

    setPage: (page: number) => {
      set((state: ProductState & ProductActions) => {
        state.pagination.page = page;
      });
      get().fetchProducts();
    },

    clearSelected: () => {
      set((state: ProductState & ProductActions) => {
        state.selectedProduct = null;
      });
    },

    clearError: () => {
      set((state: ProductState & ProductActions) => {
        state.error = null;
      });
    }
  })
});

// ==================== CART STORE ====================

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
}

export interface CartState {
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

export interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  calculateTotals: () => void;
  setError: (error: string | null) => void;
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

export const useCartStore = createStore<CartState, CartActions>({
  name: 'cart',
  initialState: initialCartState,
  persist: true,
  persistKey: 'nova-cart',
  middleware: [logger],
  actions: (set, get) => ({
    addItem: (item: Omit<CartItem, 'id'>) => {
      set((state: CartState & CartActions) => {
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

        get().calculateTotals();
      });
    },

    removeItem: (productId: string) => {
      set((state: CartState & CartActions) => {
        state.items = state.items.filter(i => i.productId !== productId);
        get().calculateTotals();
      });
    },

    updateQuantity: (productId: string, quantity: number) => {
      set((state: CartState & CartActions) => {
        const item = state.items.find(i => i.productId === productId);
        if (item) {
          item.quantity = Math.min(Math.max(1, quantity), item.maxQuantity);
        }
        get().calculateTotals();
      });
    },

    clearCart: () => {
      set((state: CartState & CartActions) => {
        state.items = [];
        state.couponCode = null;
        state.couponDiscount = 0;
        get().calculateTotals();
      });
    },

    applyCoupon: async (code: string) => {
      set((state: CartState & CartActions) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate coupon validation
        const validCoupons: Record<string, number> = {
          'SAVE10': 10,
          'SAVE20': 20,
          'FREESHIP': 0
        };

        if (code in validCoupons) {
          set((state: CartState & CartActions) => {
            state.couponCode = code;
            state.couponDiscount = validCoupons[code];
            state.isLoading = false;
          });
          get().calculateTotals();
        } else {
          throw new Error('Invalid coupon code');
        }
      } catch (error) {
        set((state: CartState & CartActions) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'Failed to apply coupon';
        });
      }
    },

    removeCoupon: () => {
      set((state: CartState & CartActions) => {
        state.couponCode = null;
        state.couponDiscount = 0;
      });
      get().calculateTotals();
    },

    calculateTotals: () => {
      set((state: CartState & CartActions) => {
        const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = state.couponDiscount
          ? (subtotal * state.couponDiscount / 100)
          : 0;
        const tax = (subtotal - discount) * 0.1; // 10% tax
        const shipping = subtotal > 100 ? 0 : 10;

        state.subtotal = subtotal;
        state.discount = discount;
        state.tax = tax;
        state.shipping = shipping;
        state.total = subtotal - discount + tax + shipping;
      });
    },

    setError: (error: string | null) => {
      set((state: CartState & CartActions) => {
        state.error = error;
      });
    }
  })
});

// ==================== UI STORE ====================

export interface UIState {
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

export interface UIActions {
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

export const useUIStore = createStore<UIState, UIActions>({
  name: 'ui',
  initialState: initialUIState,
  persist: true,
  persistKey: 'nova-ui',
  middleware: [logger],
  actions: (set, get) => ({
    toggleTheme: () => {
      set((state: UIState & UIActions) => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
      });
    },

    setTheme: (theme: 'dark' | 'light') => {
      set((state: UIState & UIActions) => {
        state.theme = theme;
      });
    },

    toggleSidebar: () => {
      set((state: UIState & UIActions) => {
        state.sidebarOpen = !state.sidebarOpen;
      });
    },

    setSidebarOpen: (open: boolean) => {
      set((state: UIState & UIActions) => {
        state.sidebarOpen = open;
      });
    },

    setSidebarWidth: (width: number) => {
      set((state: UIState & UIActions) => {
        state.sidebarWidth = width;
      });
    },

    addNotification: (notification) => {
      set((state: UIState & UIActions) => {
        state.notifications.push({
          ...notification,
          id: uuidv4(),
          createdAt: new Date()
        });
      });

      // Auto-remove after duration
      if (notification.duration) {
        setTimeout(() => {
          const current = get();
          const notif = current.notifications.find((n: any) => n.message === notification.message);
          if (notif) {
            current.removeNotification(notif.id);
          }
        }, notification.duration);
      }
    },

    removeNotification: (id: string) => {
      set((state: UIState & UIActions) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      });
    },

    clearNotifications: () => {
      set((state: UIState & UIActions) => {
        state.notifications = [];
      });
    },

    openModal: (modalId: string) => {
      set((state: UIState & UIActions) => {
        state.modals[modalId] = true;
      });
    },

    closeModal: (modalId: string) => {
      set((state: UIState & UIActions) => {
        state.modals[modalId] = false;
      });
    },

    toggleModal: (modalId: string) => {
      set((state: UIState & UIActions) => {
        state.modals[modalId] = !state.modals[modalId];
      });
    },

    setLoading: (key: string, isLoading: boolean) => {
      set((state: UIState & UIActions) => {
        state.loading[key] = isLoading;
      });
    },

    addToast: (toast) => {
      const id = uuidv4();
      set((state: UIState & UIActions) => {
        state.toasts.push({
          ...toast,
          id
        });
      });

      // Auto-remove after duration
      setTimeout(() => {
        const current = get();
        current.removeToast(id);
      }, toast.duration || 3000);
    },

    removeToast: (id: string) => {
      set((state: UIState & UIActions) => {
        state.toasts = state.toasts.filter(t => t.id !== id);
      });
    }
  })
});

// ==================== EXPORT STORES ====================

export const stores = {
  user: useUserStore,
  products: useProductStore,
  cart: useCartStore,
  ui: useUIStore
};

export default stores;
