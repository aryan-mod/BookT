import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let onUnauthorized = null;
let getAccessToken = null;
let setAccessToken = null;
let refreshPromise = null;

export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

export function setTokenHandlers(getter, setter) {
  getAccessToken = getter;
  setAccessToken = setter;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isRefreshRequest = original?.url?.includes('/auth/refresh');
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isRefreshRequest
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh');
        }
        const { data } = await refreshPromise;
        refreshPromise = null;
        const token = data.data?.accessToken || data.accessToken;
        if (token && setAccessToken) setAccessToken(token);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        refreshPromise = null;
        if (onUnauthorized) onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
