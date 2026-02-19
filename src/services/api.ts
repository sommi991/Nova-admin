import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig
} from 'axios'
import { toast } from 'react-hot-toast'

// ============================================================================
// TYPES
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type ResponseType = 'json' | 'blob' | 'text' | 'arraybuffer' | 'document' | 'stream'

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: ApiRequestConfig
}

export interface ApiError<T = any> {
  message: string
  code: string
  status: number
  data?: T
  config: ApiRequestConfig
  isNetworkError: boolean
  isTimeout: boolean
  isCancelled: boolean
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  skipCache?: boolean
  retry?: number
  retryDelay?: number
  cacheTime?: number
  showToast?: boolean
  toastSuccess?: string
  toastError?: string
  loading?: boolean
  loadingMessage?: string
  transformRequest?: (data: any) => any
  transformResponse?: (data: any) => any
}

export interface ApiCacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface ApiBatchRequest {
  id: string
  method: HttpMethod
  url: string
  data?: any
  params?: any
}

export interface ApiBatchResponse {
  id: string
  status: number
  data: any
  error?: string
}

export interface ApiPaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface ApiPaginationResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiWebSocketMessage {
  type: string
  data: any
  timestamp: number
}

export type ApiWebSocketHandler = (message: ApiWebSocketMessage) => void

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ApiConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  retry?: number
  retryDelay?: number
  cacheTime?: number
  showToast?: boolean
  loading?: boolean
  onUnauthorized?: () => void
  onError?: (error: ApiError) => void
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T>
}

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retry: 3,
  retryDelay: 1000,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  showToast: true,
  loading: false,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class ApiClient {
  private static instance: ApiClient
  private axios: AxiosInstance
  private config: ApiConfig
  private cache: Map<string, ApiCacheEntry>
  private pendingRequests: Map<string, Promise<any>>
  private activeRequests: Set<string>
  private websockets: Map<string, WebSocket>
  private websocketHandlers: Map<string, Set<ApiWebSocketHandler>>
  private retryCount: Map<string, number>

  private constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.cache = new Map()
    this.pendingRequests = new Map()
    this.activeRequests = new Set()
    this.websockets = new Map()
    this.websocketHandlers = new Map()
    this.retryCount = new Map()

    this.axios = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
      withCredentials: this.config.withCredentials
    })

    this.setupInterceptors()
  }

  public static getInstance(config?: Partial<ApiConfig>): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config)
    }
    return ApiClient.instance
  }

  // ==========================================================================
  // INTERCEPTORS
  // ==========================================================================

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const requestConfig = config as ApiRequestConfig
        
        // Add auth token
        if (!requestConfig.skipAuth) {
          const token = this.getToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        // Add request ID for deduplication
        const requestId = this.generateRequestId(requestConfig)
        config.headers['X-Request-ID'] = requestId

        // Track active request
        this.activeRequests.add(requestId)

        // Custom request transformation
        if (requestConfig.transformRequest) {
          config.data = requestConfig.transformRequest(config.data)
        }

        // Show loading toast
        if (requestConfig.loading && requestConfig.loadingMessage) {
          toast.loading(requestConfig.loadingMessage, { id: requestId })
        }

        // Call custom onRequest
        if (this.config.onRequest) {
          return this.config.onRequest(requestConfig) as InternalAxiosRequestConfig
        }

        return config
      },
      (error: AxiosError) => {
        return Promise.reject(this.normalizeError(error))
      }
    )

    // Response interceptor
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config as ApiRequestConfig
        const requestId = config.headers?.['X-Request-ID'] as string

        // Remove from active requests
        if (requestId) {
          this.activeRequests.delete(requestId)
        }

        // Dismiss loading toast
        if (config.loading && requestId) {
          toast.dismiss(requestId)
        }

        // Show success toast
        if (config.showToast && config.toastSuccess) {
          toast.success(config.toastSuccess)
        }

        // Cache response
        if (!config.skipCache && config.method?.toUpperCase() === 'GET') {
          this.setCache(config.url!, response.data)
        }

        // Custom response transformation
        if (config.transformResponse) {
          response.data = config.transformResponse(response.data)
        }

        const normalizedResponse = this.normalizeResponse(response)

        // Call custom onResponse
        if (this.config.onResponse) {
          return this.config.onResponse(normalizedResponse) as any
        }

        return normalizedResponse
      },
      async (error: AxiosError) => {
        const config = error.config as ApiRequestConfig
        const requestId = config?.headers?.['X-Request-ID'] as string

        // Remove from active requests
        if (requestId) {
          this.activeRequests.delete(requestId)
        }

        // Dismiss loading toast
        if (config?.loading && requestId) {
          toast.dismiss(requestId)
        }

        const apiError = this.normalizeError(error)

        // Handle retry logic
        if (this.shouldRetry(error, config)) {
          return this.retryRequest(config)
        }

        // Show error toast
        if (config?.showToast) {
          const message = config.toastError || apiError.message
          toast.error(message)
        }

        // Handle unauthorized
        if (apiError.status === 401 && this.config.onUnauthorized) {
          this.config.onUnauthorized()
        }

        // Call global error handler
        if (this.config.onError) {
          this.config.onError(apiError)
        }

        return Promise.reject(apiError)
      }
    )
  }

  // ==========================================================================
  // REQUEST METHODS
  // ==========================================================================

  public async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId({ method, url, data, ...config })
    
    // Check for duplicate pending request
    if (this.pendingRequests.has(requestId)) {
      return this.pendingRequests.get(requestId)
    }

    // Check cache for GET requests
    if (method === 'GET' && !config?.skipCache) {
      const cached = this.getCache<T>(url)
      if (cached) {
        return Promise.resolve({
          data: cached,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config || {}
        })
      }
    }

    const promise = this.axios.request<T>({
      method,
      url,
      data,
      ...config
    })

    this.pendingRequests.set(requestId, promise)
    
    try {
      const response = await promise
      return response as ApiResponse<T>
    } finally {
      this.pendingRequests.delete(requestId)
    }
  }

  public async get<T = any>(
    url: string,
    params?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, null, { ...config, params })
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config)
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config)
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config)
  }

  public async delete<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, null, config)
  }

  public async head<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('HEAD', url, null, config)
  }

  public async options<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('OPTIONS', url, null, config)
  }

  // ==========================================================================
  // BATCH REQUESTS
  // ==========================================================================

  public async batch(
    requests: ApiBatchRequest[],
    config?: ApiRequestConfig
  ): Promise<ApiBatchResponse[]> {
    const promises = requests.map(req => 
      this.request(req.method, req.url, req.data, { ...config, params: req.params })
        .then(res => ({
          id: req.id,
          status: res.status,
          data: res.data
        }))
        .catch(err => ({
          id: req.id,
          status: err.status || 500,
          data: null,
          error: err.message
        }))
    )

    return Promise.all(promises)
  }

  // ==========================================================================
  // PAGINATION
  // ==========================================================================

  public async paginate<T = any>(
    url: string,
    params: ApiPaginationParams = {},
    config?: ApiRequestConfig
  ): Promise<ApiPaginationResponse<T>> {
    const response = await this.get<{
      data: T[]
      total: number
      page: number
      limit: number
    }>(url, params, config)

    const { data, total, page, limit } = response.data

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }

  // ==========================================================================
  // FILE UPLOAD/DOWNLOAD
  // ==========================================================================

  public async upload(
    url: string,
    file: File,
    onProgress?: (percentage: number) => void,
    config?: ApiRequestConfig
  ): Promise<ApiResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return this.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentage)
        }
      }
    })
  }

  public async uploadMultiple(
    url: string,
    files: File[],
    onProgress?: (percentage: number) => void,
    config?: ApiRequestConfig
  ): Promise<ApiResponse> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return this.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentage)
        }
      }
    })
  }

  public async download(
    url: string,
    filename?: string,
    config?: ApiRequestConfig
  ): Promise<void> {
    const response = await this.get<Blob>(url, null, {
      ...config,
      responseType: 'blob'
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // ==========================================================================
  // WEBSOCKET
  // ==========================================================================

  public connectWebSocket(
    url: string,
    protocols?: string | string[]
  ): WebSocket {
    if (this.websockets.has(url)) {
      return this.websockets.get(url)!
    }

    const ws = new WebSocket(url, protocols)
    
    ws.onopen = () => {
      console.log(`WebSocket connected: ${url}`)
    }

    ws.onmessage = (event) => {
      try {
        const message: ApiWebSocketMessage = JSON.parse(event.data)
        const handlers = this.websocketHandlers.get(url)
        if (handlers) {
          handlers.forEach(handler => handler(message))
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error: ${url}`, error)
    }

    ws.onclose = () => {
      console.log(`WebSocket closed: ${url}`)
      this.websockets.delete(url)
      this.websocketHandlers.delete(url)
    }

    this.websockets.set(url, ws)
    return ws
  }

  public disconnectWebSocket(url: string): void {
    const ws = this.websockets.get(url)
    if (ws) {
      ws.close()
      this.websockets.delete(url)
      this.websocketHandlers.delete(url)
    }
  }

  public subscribeWebSocket(
    url: string,
    handler: ApiWebSocketHandler
  ): () => void {
    if (!this.websocketHandlers.has(url)) {
      this.websocketHandlers.set(url, new Set())
    }

    this.websocketHandlers.get(url)!.add(handler)

    return () => {
      const handlers = this.websocketHandlers.get(url)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.disconnectWebSocket(url)
        }
      }
    }
  }

  public sendWebSocketMessage(url: string, message: any): void {
    const ws = this.websockets.get(url)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  private getCacheKey(url: string, params?: any): string {
    return params ? `${url}?${JSON.stringify(params)}` : url
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (this.config.cacheTime || 300000)
    })
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public invalidateCache(key: string): void {
    this.cache.delete(key)
  }

  // ==========================================================================
  // RETRY LOGIC
  // ==========================================================================

  private shouldRetry(error: AxiosError, config?: ApiRequestConfig): boolean {
    if (!config?.retry) return false

    const requestId = this.generateRequestId(config)
    const retryCount = this.retryCount.get(requestId) || 0

    if (retryCount >= config.retry) return false

    // Retry on network errors or specific status codes
    if (!error.response || error.code === 'ECONNABORTED') {
      return true
    }

    const status = error.response.status
    return status >= 500 || status === 429
  }

  private async retryRequest(config: ApiRequestConfig): Promise<any> {
    const requestId = this.generateRequestId(config)
    const retryCount = (this.retryCount.get(requestId) || 0) + 1
    this.retryCount.set(requestId, retryCount)

    const delay = (config.retryDelay || 1000) * Math.pow(2, retryCount - 1)
    await new Promise(resolve => setTimeout(resolve, delay))

    return this.axios.request(config)
  }

  // ==========================================================================
  // REQUEST CANCELLATION
  // ==========================================================================

  public cancelRequest(requestId: string): void {
    const promise = this.pendingRequests.get(requestId)
    if (promise && typeof (promise as any).cancel === 'function') {
      ;(promise as any).cancel()
      this.pendingRequests.delete(requestId)
    }
  }

  public cancelAllRequests(): void {
    this.pendingRequests.forEach((_, requestId) => {
      this.cancelRequest(requestId)
    })
  }

  // ==========================================================================
  // REQUEST DEDUPLICATION
  // ==========================================================================

  private generateRequestId(config: Partial<ApiRequestConfig>): string {
    const { method, url, params, data } = config
    return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`
  }

  public isRequestPending(requestId: string): boolean {
    return this.pendingRequests.has(requestId)
  }

  public getActiveRequests(): string[] {
    return Array.from(this.activeRequests)
  }

  // ==========================================================================
  // AUTH TOKEN MANAGEMENT
  // ==========================================================================

  private getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  public setToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  public removeToken(): void {
    localStorage.removeItem('auth_token')
  }

  // ==========================================================================
  // RESPONSE/ERROR NORMALIZATION
  // ==========================================================================

  private normalizeResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      config: response.config as ApiRequestConfig
    }
  }

  private normalizeError(error: AxiosError): ApiError {
    const isNetworkError = !error.response && !!error.isAxiosError
    const isTimeout = error.code === 'ECONNABORTED'
    const isCancelled = axios.isCancel(error)

    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 0,
      data: error.response?.data,
      config: error.config as ApiRequestConfig,
      isNetworkError,
      isTimeout,
      isCancelled
    }
  }

  // ==========================================================================
  // CONFIGURATION
  // ==========================================================================

  public updateConfig(config: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...config }
    
    // Update axios defaults
    if (config.baseURL) {
      this.axios.defaults.baseURL = config.baseURL
    }
    if (config.timeout) {
      this.axios.defaults.timeout = config.timeout
    }
    if (config.headers) {
      this.axios.defaults.headers = {
        ...this.axios.defaults.headers,
        ...config.headers
      }
    }
    if (config.withCredentials !== undefined) {
      this.axios.defaults.withCredentials = config.withCredentials
    }
  }

  public getConfig(): ApiConfig {
    return { ...this.config }
  }
}

// ============================================================================
// API HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react'

export function useApi<T = any>(
  url: string,
  options?: {
    method?: HttpMethod
    params?: any
    data?: any
    config?: ApiRequestConfig
    autoFetch?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: ApiError) => void
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const api = ApiClient.getInstance()
  const abortControllerRef = useRef<AbortController>()

  const fetchData = useCallback(async (overrideConfig?: ApiRequestConfig) => {
    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)

    try {
      const config = {
        ...options?.config,
        ...overrideConfig,
        signal: abortControllerRef.current.signal
      }

      let response: ApiResponse<T>

      switch (options?.method || 'GET') {
        case 'GET':
          response = await api.get<T>(url, options?.params, config)
          break
        case 'POST':
          response = await api.post<T>(url, options?.data, config)
          break
        case 'PUT':
          response = await api.put<T>(url, options?.data, config)
          break
        case 'PATCH':
          response = await api.patch<T>(url, options?.data, config)
          break
        case 'DELETE':
          response = await api.delete<T>(url, config)
          break
        default:
          throw new Error(`Unsupported method: ${options?.method}`)
      }

      setData(response.data)
      options?.onSuccess?.(response.data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      options?.onError?.(apiError)
    } finally {
      setLoading(false)
    }
  }, [url, options?.method, options?.params, options?.data, options?.config])

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData()
    }

    return () => {
      cancel()
    }
  }, [fetchData, cancel, options?.autoFetch])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    cancel
  }
}

export function useInfiniteApi<T = any>(
  url: string,
  options?: {
    params?: ApiPaginationParams
    config?: ApiRequestConfig
    onSuccess?: (data: T[]) => void
    onError?: (error: ApiError) => void
  }
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const api = ApiClient.getInstance()

  const fetchMore = useCallback(async () => {
    if (!hasMore || loadingMore) return

    setLoadingMore(true)

    try {
      const response = await api.paginate<T>(url, {
        ...options?.params,
        page
      })

      setItems(prev => [...prev, ...response.data])
      setHasMore(response.hasNext)
      setPage(prev => prev + 1)
      options?.onSuccess?.(response.data)
    } catch (err) {
      setError(err as ApiError)
      options?.onError?.(err as ApiError)
    } finally {
      setLoadingMore(false)
    }
  }, [url, page, hasMore, loadingMore, options?.params])

  const refresh = useCallback(async () => {
    setLoading(true)
    setItems([])
    setPage(1)
    setHasMore(true)

    try {
      const response = await api.paginate<T>(url, {
        ...options?.params,
        page: 1
      })

      setItems(response.data)
      setHasMore(response.hasNext)
      setPage(2)
      options?.onSuccess?.(response.data)
    } catch (err) {
      setError(err as ApiError)
      options?.onError?.(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [url, options?.params])

  useEffect(() => {
    refresh()
  }, [])

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchMore,
    refresh
  }
}

export function useMutation<T = any, R = any>(
  method: HttpMethod,
  url: string,
  options?: {
    config?: ApiRequestConfig
    onSuccess?: (data: R) => void
    onError?: (error: ApiError) => void
  }
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [data, setData] = useState<R | null>(null)
  const api = ApiClient.getInstance()

  const mutate = useCallback(async (payload?: T, mutateConfig?: ApiRequestConfig) => {
    setLoading(true)
    setError(null)

    try {
      let response: ApiResponse<R>

      switch (method) {
        case 'POST':
          response = await api.post<R>(url, payload, { ...options?.config, ...mutateConfig })
          break
        case 'PUT':
          response = await api.put<R>(url, payload, { ...options?.config, ...mutateConfig })
          break
        case 'PATCH':
          response = await api.patch<R>(url, payload, { ...options?.config, ...mutateConfig })
          break
        case 'DELETE':
          response = await api.delete<R>(url, { ...options?.config, ...mutateConfig })
          break
        default:
          throw new Error(`Unsupported mutation method: ${method}`)
      }

      setData(response.data)
      options?.onSuccess?.(response.data)
      return response.data
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      options?.onError?.(apiError)
      throw apiError
    } finally {
      setLoading(false)
    }
  }, [method, url, options?.config])

  return {
    mutate,
    loading,
    error,
    data
  }
}

// ============================================================================
// EXPORT API INSTANCE
// ============================================================================

export const api = ApiClient.getInstance()

export default api
