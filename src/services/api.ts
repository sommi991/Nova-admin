import axios from 'axios';
import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response = await axios({
        method,
        url: `${this.baseURL}${url}`,
        data,
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || error.message || 'Request failed',
        status: error.response?.status || 500,
      };
    }
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, params);
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data);
  }

  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data);
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url);
  }

  async upload<T = any>(url: string, file: File, onProgress?: (percentage: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${this.baseURL}${url}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentage);
          }
        },
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || error.message || 'Upload failed',
        status: error.response?.status || 500,
      };
    }
  }

  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}${url}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      toast.error('Download failed');
    }
  }
}

// ============================================================================
// API HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useApi<T = any>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    params?: any;
    data?: any;
    autoFetch?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = new ApiClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (options?.method || 'GET') {
        case 'GET':
          response = await api.get<T>(url, options?.params);
          break;
        case 'POST':
          response = await api.post<T>(url, options?.data);
          break;
        case 'PUT':
          response = await api.put<T>(url, options?.data);
          break;
        case 'PATCH':
          response = await api.patch<T>(url, options?.data);
          break;
        case 'DELETE':
          response = await api.delete<T>(url);
          break;
        default:
          response = await api.get<T>(url, options?.params);
      }

      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [url, options?.method, JSON.stringify(options?.params), JSON.stringify(options?.data)]);

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useMutation<T = any, R = any>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<R | null>(null);
  const api = new ApiClient();

  const mutate = useCallback(async (payload?: T) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (method) {
        case 'POST':
          response = await api.post<R>(url, payload);
          break;
        case 'PUT':
          response = await api.put<R>(url, payload);
          break;
        case 'PATCH':
          response = await api.patch<R>(url, payload);
          break;
        case 'DELETE':
          response = await api.delete<R>(url);
          break;
      }

      setData(response.data);
      toast.success('Operation successful');
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Operation failed');
      toast.error(err.message || 'Operation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [method, url]);

  return { mutate, loading, error, data };
}

// ============================================================================
// EXPORT
// ============================================================================

export const api = new ApiClient();
export default api;
