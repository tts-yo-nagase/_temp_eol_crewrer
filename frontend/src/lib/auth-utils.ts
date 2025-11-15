import { getSession } from "next-auth/react";
import { getApiUrl } from "./config-client";

// API URL will be fetched dynamically from server
let API_BASE_URL: string | null = null;

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface AuthTokenResult {
  token: string | null;
  error: string | null;
}

/**
 * Clear the cached token (e.g., on logout or token refresh)
 */
export function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = 0;
}

/**
 * Common function to get NextAuth JWT token with caching
 * @returns Promise<AuthTokenResult> - Token and error information
 */
export async function getAuthToken(): Promise<AuthTokenResult> {
  try {
    // Check if we have a valid cached token
    if (cachedToken && Date.now() < tokenExpiry) {
      return {
        token: cachedToken,
        error: null,
      };
    }

    // Check session
    const session = await getSession();

    if (!session) {
      clearTokenCache();
      return {
        token: null,
        error: "Login is required",
      };
    }

    // Get NextAuth JWT token
    const tokenRes = await fetch("/api/auth/token");

    if (!tokenRes.ok) {
      clearTokenCache();
      return {
        token: null,
        error: "Failed to get token",
      };
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.token) {
      clearTokenCache();
      return {
        token: null,
        error: "No valid token found",
      };
    }

    // Cache the token
    cachedToken = tokenData.token;
    tokenExpiry = Date.now() + TOKEN_CACHE_DURATION;

    return {
      token: tokenData.token,
      error: null,
    };
  } catch (err) {
    console.error("Token retrieval error:", err);
    clearTokenCache();
    return {
      token: null,
      error: "Network error occurred",
    };
  }
}

/**
 * Common function to send API requests with Authorization header
 * @param endpoint - API endpoint (e.g., '/protected')
 * @param options - fetch options
 * @returns Promise<T> - typed JSON response
 */
export async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { token, error } = await getAuthToken();

  if (error || !token) {
    throw new Error(error || "Failed to get authentication token");
  }

  // Get API URL dynamically
  if (!API_BASE_URL) {
    API_BASE_URL = await getApiUrl();
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Add base URL if endpoint is not a full URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to extract error message from response body
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();

        if (errorData.message) {
          // NestJS validation errors return message as string or array
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
    } catch (e) {
      // If parsing fails, use default error message
      console.error('Failed to parse error response:', e);
    }
    throw new Error(errorMessage);
  }

  // Handle empty response (e.g., DELETE operations)
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

/**
 * Common function to send API requests without authentication
 * @param endpoint - API endpoint (e.g., '/protected-public')
 * @param options - fetch options
 * @returns Promise<T> - typed JSON response
 */
export async function fetchWithoutAuth<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get API URL dynamically
  if (!API_BASE_URL) {
    API_BASE_URL = await getApiUrl();
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add base URL if endpoint is not a full URL
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to extract error message from response body
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();

        if (errorData.message) {
          // NestJS validation errors return message as string or array
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
    } catch (e) {
      // If parsing fails, use default error message
      console.error('Failed to parse error response:', e);
    }
    throw new Error(errorMessage);
  }

  // Handle empty response (e.g., DELETE operations)
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
