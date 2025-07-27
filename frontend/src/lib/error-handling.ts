import { ERROR_MESSAGES } from './constants';

export interface AppError {
  message: string;
  code?: string;
  originalError?: unknown;
}

export function createAppError(
  message: string,
  originalError?: unknown
): AppError {
  return {
    message,
    originalError,
  };
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof Error) {
    // Check for common network errors
    if (error.message.includes('fetch')) {
      return createAppError(ERROR_MESSAGES.NETWORK_ERROR, error);
    }

    return createAppError(error.message, error);
  }

  // Handle axios errors or other error shapes
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
      message?: string;
    };
    if (errorObj.response?.data?.detail) {
      return createAppError(errorObj.response.data.detail, error);
    }
    if (errorObj.response?.data?.message) {
      return createAppError(errorObj.response.data.message, error);
    }
    if (errorObj.message) {
      return createAppError(errorObj.message, error);
    }
  }

  return createAppError('An unexpected error occurred', error);
}

export function isNetworkError(error: AppError): boolean {
  return error.message === ERROR_MESSAGES.NETWORK_ERROR;
}

// Safe JSON parsing with runtime validation
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    // Basic validation - can be enhanced with schema validation
    if (parsed === null || parsed === undefined) {
      return fallback;
    }
    return parsed as T;
  } catch (parseError) {
    console.warn('JSON parse failed:', parseError);
    return fallback;
  }
}

// Safe localStorage operations
export function safeLocalStorageGet(
  key: string,
  fallback: string = ''
): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
