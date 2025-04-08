import { auth } from "../config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_URL;
/**
 * Lấy token xác thực từ Firebase
 */
async function getAuthToken(): Promise<string | null> {
  if (!auth || !auth.currentUser) {
    return null;
  }
  return auth.currentUser.getIdToken();
}

/**
 * Tạo headers với token xác thực
 */
async function createAuthHeaders(): Promise<Headers> {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const token = await getAuthToken();
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  return headers;
}

/**
 * API request cơ bản
 */
async function apiRequest<T>(
  endpoint: string,
  method: string,
  body?: object
): Promise<T> {
  const headers = await createAuthHeaders();
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Ignore JSON parsing errors
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * API functions
 */
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, "GET"),
  post: <T>(endpoint: string, data: object) => apiRequest<T>(endpoint, "POST", data),
  put: <T>(endpoint: string, data: object) => apiRequest<T>(endpoint, "PUT", data),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, "DELETE"),
};