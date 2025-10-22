/**
 * Axios Client Configuration
 *
 * Configures a centralized axios instance with interceptors for:
 * - Request authentication (logging for now, ready for future token injection)
 * - Response error handling and transformation
 * - Environment-based configuration
 */

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '@/types';

export interface ApiError {
  status?: number;
  detail: string;
  originalError?: unknown;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Currently logs requests for debugging. Ready for future authentication token injection.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });

    // Future: Inject authentication token here
    // const token = getAuthToken();
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles successful responses and transforms errors into a consistent format
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },

  (error: AxiosError<ErrorResponse>) => {
    const apiError: ApiError = {
      detail: 'An unexpected error occurred',
      originalError: error,
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.detail = error.response.data?.detail || error.message;

      console.error(
        `[API Error] ${error.response.status} ${error.config?.url}`,
        {
          detail: apiError.detail,
          data: error.response.data,
        }
      );
    } else if (error.request) {
      apiError.detail = 'Network error: Unable to reach the server';
      console.error('[API Network Error]', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      apiError.detail = error.message;
      console.error('[API Configuration Error]', error.message);
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
