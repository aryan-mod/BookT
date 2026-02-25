# Auth Flow & Frontend Integration

## Backend API Contract

### Login / Register
- **Response**: `{ status, message, data: { user, accessToken, expiresIn } }`
- **Cookie**: `refreshToken` (HttpOnly, Secure in prod, SameSite=none)
- Access token is **NOT** in a cookie—store in memory only on frontend.

### Refresh (`POST /api/v1/auth/refresh`)
- **Request**: No body; sends `refreshToken` cookie automatically
- **Response**: `{ status, message, data: { accessToken, expiresIn } }`
- **Cookie**: New `refreshToken` (rotation)

### Logout (`POST /api/v1/auth/logout`)
- **Request**: Sends `refreshToken` cookie (no access token needed)
- **Response**: `{ status, message }`
- Clears cookie and invalidates refresh token server-side.

---

## Frontend Integration Example

### 1. Axios configuration
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,  // Required for HttpOnly cookies
});

// Store accessToken in memory (e.g. via AuthContext)
api.interceptors.request.use((config) => {
  const token = getAccessToken();  // from React state/ref, NOT localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try refresh, then retry or logout
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        clearAuth();
      }
    }
    return Promise.reject(err);
  }
);
```

### 2. AuthContext (logout example)
```javascript
const logout = useCallback(async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken(null);
    setUser(null);
  }
}, []);
```

---

## Security Notes
- Access token: 15 min expiry, in-memory only
- Refresh token: 7 days, HttpOnly cookie
- Cookies require `credentials: true` / `withCredentials: true` in CORS and axios
- Never store access token in localStorage
