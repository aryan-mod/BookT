# BookTracker — Project Summary

**MERN Stack SaaS | Book Reader Platform**

---

## 1. Resume-Ready Description (3–5 lines)

**BookTracker** is a full-stack MERN (MongoDB, Express, React, Node.js) SaaS application for tracking reading progress and managing books. The backend uses an MVC architecture with a versioned REST API (`/api/v1`), JWT access tokens with refresh-token rotation stored in HttpOnly cookies, and centralized error handling. The React (Vite) frontend uses Context API for auth, Axios interceptors for 401/refresh flow, and memory-based access tokens for security. The app includes register, login, logout, session restore, role-ready structure, book listing, and a protected dashboard, with security hardening via helmet, rate limiting, sanitization, and CORS configured for credentials.

---

## 2. Technical Architecture Summary

| Layer | Stack | Highlights |
|-------|--------|------------|
| **Frontend** | React 18, Vite | SPA with Context API, Axios, protected routes, loading/error states |
| **Backend** | Node.js, Express | MVC, versioned API (`/api/v1`), env-based config |
| **Database** | MongoDB | Mongoose ODM, models: User, Book, Goal, Highlight, Note, ReadingProgress, ReadingSession, RefreshToken |
| **Auth** | JWT + HttpOnly cookies | Access token (15 min), refresh token (7 days), rotation-ready, logout invalidation |
| **API** | REST | Standard response format, AppError-based error handling, scoped rate limiting (login/register) |

**Key patterns:**  
- **Backend:** Controllers → routes → middleware (auth, validate, security, errorHandler).  
- **Frontend:** AuthContext for user/session, Axios instance with `withCredentials`, refresh-before-me on load, ProtectedRoute for guarded pages.  
- **Cookies:** Dev (SameSite Lax) vs Prod (SameSite Strict); credentials sent cross-origin only where allowed by CORS.

---

## 3. Authentication Flow (Step-by-Step)

1. **Register**  
   User submits email/password → backend validates → hashes password → creates User → returns success; no tokens until login.

2. **Login**  
   User submits credentials → backend validates → issues JWT access token (15 min) in response body and refresh token (7 days) in HttpOnly cookie → frontend stores only access token in memory; cookie is sent automatically on same-site/cross-origin requests when `withCredentials: true`.

3. **Session restore (refresh-before-me on app load)**  
   On app load, frontend does not assume localStorage. It calls a “refresh” or “me” endpoint with the HttpOnly cookie. Backend validates refresh token → optionally rotates it (rotation-ready) → returns new access token. Frontend stores access token in memory; user is considered logged in.

4. **Authenticated requests**  
   Axios interceptor adds `Authorization: Bearer <access_token>` from memory. If API returns 401, interceptor triggers refresh: send request with cookie only → get new access token → retry original request. If refresh fails (e.g. expired/invalid), redirect to login and clear in-memory token.

5. **Logout**  
   Frontend calls logout API with credentials (cookie sent). Backend invalidates refresh token (e.g. delete from RefreshToken model or blacklist). Frontend clears in-memory access token; browser drops cookie on client-side logout instruction if applicable. User must log in again.

6. **Role-based access (ready)**  
   JWT payload can include a role; backend middleware checks `req.user.role` for protected routes; frontend can show/hide UI by role. Same flow as above; only authorization checks are added.

---

## 4. Security Features List

- **JWT access tokens:** Short-lived (15 min) to limit exposure; stored in memory only (no localStorage).
- **Refresh tokens:** Long-lived (7 days), stored in HttpOnly cookie (not accessible to JS), rotation-ready to limit reuse.
- **Token invalidation:** Logout invalidates refresh token in DB (RefreshToken model); no valid session after logout.
- **CORS:** Proper configuration with credentials; only allowed origins get cookies.
- **Helmet:** Secure HTTP headers (XSS, clickjacking, MIME sniffing, etc.).
- **express-mongo-sanitize:** Prevents NoSQL injection (e.g. `$` and `.` in input).
- **xss-clean:** Sanitizes user input to mitigate XSS.
- **Rate limiting:** Scoped to login and register to prevent brute-force and abuse; uses express-rate-limit.
- **Environment-based config:** Secrets and keys in env; no hardcoded credentials.
- **Password handling:** Passwords hashed (e.g. bcrypt) before storage; never logged or returned in API.
- **Protected routes:** Backend middleware verifies JWT; frontend ProtectedRoute redirects unauthenticated users to login.

---

## 5. Scalability & Future Roadmap

**Current scale-ready aspects:**  
- Versioned API (`/api/v1`) allows non-breaking changes and multiple client versions.  
- MVC and clear separation of routes, controllers, and models make it easy to add features and tests.  
- RefreshToken model supports session management and future “sessions list” or “revoke all” features.  
- Role-ready structure allows adding more roles and permissions without changing core auth flow.

**Planned / logical next steps:**  
- **Horizontal scaling:** Stateless API (JWT + DB-backed refresh tokens); add load balancer; MongoDB replica set.  
- **Caching:** Redis for session/refresh token blacklist or rate-limit counters.  
- **Features:** Reading goals, highlights, notes, reading sessions (models already present); social features, recommendations, mobile app (same API).  
- **DevOps:** Docker, CI/CD, env-based deployments (dev/staging/prod).  
- **Monitoring:** Logging, error tracking (e.g. Sentry), and basic metrics for auth and book endpoints.

---

## 6. Interview Explanation Script (1–2 minutes)

*“BookTracker is a MERN stack SaaS app I built for tracking reading and managing books. On the backend I use Node and Express with an MVC setup and a versioned API under `/api/v1`. I use JWT for access tokens with a 15-minute expiry and refresh tokens stored in HttpOnly cookies for seven days, with refresh token rotation in mind and invalidation on logout. I also use helmet, rate limiting on login and register, sanitization, and CORS configured for credentials.*

*On the frontend I use React with Vite and the Context API for auth. I keep the access token only in memory—not in localStorage—and use an Axios interceptor to handle 401s by refreshing the token and retrying. On app load I run a refresh-before-me flow so the session is restored from the cookie. Protected routes and a role-ready structure are in place.*

*Features include register, login, logout, session restore, book listing, and a protected dashboard. I can walk you through the auth flow or the security choices in more detail if you’d like.”*

---

*Use this summary for resumes, LinkedIn, portfolio, and technical interviews. Adjust numbers (e.g. token expiry) if your actual config differs.*
