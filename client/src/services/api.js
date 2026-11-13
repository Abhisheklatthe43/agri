import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Get the current user's JWT access token
 */
export const getAuthToken = async () => {
  if (isSupabaseConfigured) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
  }

  // Check local storage for demo session token
  const demoToken = localStorage.getItem('agrismart_demo_token');
  return demoToken || null;
};

/**
 * Universal API request wrapper
 */
export const apiRequest = async (endpoint, { method = 'GET', body, isFormData = false, headers = {} } = {}) => {
  const token = await getAuthToken();

  const requestHeaders = {
    ...headers
  };

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.code = data?.error?.code;
    error.details = data?.error?.details;
    throw error;
  }

  return data;
};
