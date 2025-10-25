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
import { logger } from '@/utils/logger';
import { ApiError } from './errors';

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
    logger.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
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
    logger.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles successful responses and transforms errors into a consistent format
 */
apiClient.interceptors.response.use(
  (response) => {
    logger.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },

  (error: AxiosError<ErrorResponse>) => {
    let errorMessage = 'An unexpected error occurred';
    let status: number | undefined;

    if (error.response) {
      status = error.response.status;
      errorMessage = error.response.data?.detail || error.message;

      logger.error(
        `[API Error] ${error.response.status} ${error.config?.url}`,
        {
          detail: errorMessage,
          data: error.response.data,
        }
      );
    } else if (error.request) {
      errorMessage = 'Network error: Unable to reach the server';
      logger.error('[API Network Error]', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      errorMessage = error.message;
      logger.error('[API Configuration Error]', error.message);
    }

    // Throw an ApiError instance instead of a plain object
    return Promise.reject(new ApiError(errorMessage, status, error));
  }
);

export default apiClient;
