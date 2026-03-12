# BookT - Complete Project Documentation

> A full-stack **Book Tracking & Reading Analytics** platform for managing personal libraries, tracking reading progress, and visualizing reading habits.

---

## 1. Project Overview

**BookT** (Book Tracker) is a MERN-stack web application that enables users to:

- **Build a personal library** from external sources (Google Books, Open Library) and user-uploaded PDFs
- **Track reading progress** with page numbers, status (wishlist/reading/completed), ratings, and dates
- **Visualize reading analytics** via streak tracking, heatmaps, charts, and activity feeds
- **Set and monitor reading goals** with yearly targets
- **Request new books** for the global catalogue, with admin approval workflow
- **Admin panel** for user management, book requests, and platform analytics

The project follows industry best practices for security (JWT with refresh tokens, HttpOnly cookies), scalability (aggregated book search from multiple APIs), and maintainability (modular architecture, express-validator, error handling).

---

## 2. Main Features

| Feature | Description |
|---------|-------------|
| **User Authentication** | Email/password + Google OAuth, JWT access + refresh tokens |
| **Personal Library** | Add books from Google Books/Open Library or upload PDFs (Cloudinary) |
| **Reading Progress** | Track current page, status, rating, start/end dates for each book |
| **Reading Analytics** | Streaks, heatmap, charts, activity feed, word cloud |
| **Reading Goals** | Set yearly book targets and track completion |
| **Book Search** | Aggregated search across Google Books + Open Library |
| **PDF Reader** | In-browser PDF viewer with progress sync |
| **Book Requests** | Users request new catalogue books; admins approve/reject |
| **Admin Panel** | User management, ban/unban, request review, audit logs |
| **Dark/Light Theme** | Theme toggle with persistence |

---

## 3. Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client (with interceptors) |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **GSAP** | Advanced animations |
| **Recharts** | Charts & visualizations |
| **react-pdf** | PDF viewer |
| **@react-oauth/google** | Google Sign-In |
| **Zod** | Schema validation |
| **react-hook-form** + **@hookform/resolvers** | Form handling |
| **Lucide React** | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express 4** | Web framework |
| **MongoDB** | Database |
| **Mongoose 8** | ODM |
| **JWT (jsonwebtoken)** | Access & refresh tokens |
| **bcryptjs** | Password hashing |
| **google-auth-library** | Google OAuth verification |
| **Cloudinary** | PDF storage |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **CORS** | Cross-origin config |
| **express-mongo-sanitize** | NoSQL injection prevention |
| **xss-clean** | XSS prevention |
| **express-validator** | Input validation |
| **express-rate-limit** | Rate limiting |
| **cookie-parser** | Cookie parsing |
| **Axios** | External API calls (Google Books, Open Library) |

---

## 4. Architecture (Folder Structure)

### High-Level MVC-Style Layout

The backend follows a **layered architecture** (controllers → services → models), while the frontend uses **component-based** structure with context for state.

### Frontend Structure

```
src/
├── api/           # Axios instance, interceptors
├── components/    # Reusable UI components
│   ├── admin/     # Admin-specific components
│   └── ui/        # Primitives (Button, Input, Card, etc.)
├── context/       # AuthContext, ToastContext, LibraryContext
├── data/          # Mock data
├── hooks/         # useBooks, useTheme, useDebounce, useLocalStorage
├── pages/         # Route-level pages
│   └── admin/     # Admin sub-pages
└── main.jsx
```

### Backend Structure

```
backend/
├── config/        # db, cloudinary, rateLimit, redis (placeholder)
├── server.js      # Entry point
└── src/
    ├── app.js     # Express app, middleware
    ├── controllers/   # Request handlers
    ├── middleware/    # auth, validate, errorHandler, security
    ├── middlewares/   # upload, validateSearchQuery
    ├── models/        # Mongoose schemas
    ├── routes/        # Route definitions
    ├── services/      # bookAggregator, googleBooks, openLibrary, cache
    └── utils/         # tokenUtils, cookieUtils, AppError, catchAsync, logger
```

---

## 5. Authentication System

### Token Strategy

| Token | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| **Access Token** | In-memory (React state) | 15 min | API authorization |
| **Refresh Token** | HttpOnly cookie | 7 days | Obtain new access token |

- Access token sent in `Authorization: Bearer <token>` header
- Refresh token sent automatically via `credentials: true` (cookies)
- **Refresh rotation**: New refresh token issued on each refresh; reuse detection revokes all sessions

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register (email/password) |
| POST | `/api/v1/auth/login` | Login (email/password) |
| POST | `/api/v1/auth/google` | Google OAuth login |
| POST | `/api/v1/auth/refresh` | Refresh access token (cookie) |
| POST | `/api/v1/auth/logout` | Logout, clear cookie |
| GET | `/api/v1/auth/me` | Current user (protected) |

### Frontend Flow

1. **Initial load**: `AuthContext` calls `POST /auth/refresh` to restore session
2. **401 responses**: Axios interceptor calls refresh, retries original request
3. **Refresh failure**: `onUnauthorized` clears state, redirects to `/login`

### Security Details

- Passwords hashed with bcrypt (factor 12)
- Google login verifies ID token via `google-auth-library`
- Banned users blocked on login and refresh
- Input validation with express-validator on auth routes

---

## 6. Database Models and Relationships

### Entity Relationship Summary

```
User ──┬── RefreshToken (1:N)
       ├── ReadingProgress (1:N) ──► Book
       ├── Goal (1:N)
       ├── BookRequest (1:N)
       ├── UploadedBook (1:N)
       ├── ReadingSession (1:N)
       ├── Note (1:N)
       └── Highlight (1:N)

Book ──┬── ReadingProgress (1:N)
       └── PreviewClick (1:N)

UploadedBook ──┬── UploadedBookReadingProgress (1:N)
               └── UploadedBookReadingSession (1:N)
```

### Models

| Model | File | Key Fields |
|-------|------|------------|
| **User** | `User.js` | name, email, password, provider (local/google), role (user/admin), isBanned |
| **RefreshToken** | `RefreshToken.js` | Token family for rotation |
| **Book** | `Book.js` | title, author, pages, cover, genre[], description |
| **ReadingProgress** | `ReadingProgress.js` | user, book, externalId, externalSource, currentPage, status, rating, startDate, endDate, percentage |
| **BookRequest** | `BookRequest.js` | title, author, requestedBy, status (pending/approved/rejected) |
| **UploadedBook** | `UploadedBook.js` | user, title, fileUrl, publicId, totalPages |
| **Goal** | `Goal.js` | user, targetBooks, completedBooks, year |
| **ReadingSession** | `ReadingSession.js` | Reading session data |
| **UploadedBookReadingProgress** | `UploadedBookReadingProgress.js` | Progress for uploaded PDFs |
| **UploadedBookReadingSession** | `UploadedBookReadingSession.js` | Sessions for uploaded PDFs |
| **Note** | `Note.js` | User notes |
| **Highlight** | `Highlight.js` | User highlights |
| **PreviewClick** | `PreviewClick.js` | Preview click analytics |
| **AdminAction** | `AdminAction.js` | Admin audit log |

---

## 7. API Endpoints

### Base URL: `/api/v1`

### Auth (`/auth`)

| Method | Path | Auth | Rate Limit |
|--------|------|------|------------|
| POST | `/register` | No | registerLimiter |
| POST | `/login` | No | loginLimiter |
| POST | `/google` | No | loginLimiter |
| POST | `/refresh` | Cookie | authLimiter |
| POST | `/logout` | Cookie | authLimiter |
| GET | `/me` | protect | authLimiter |

### Books (`/books`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search` | optional | Aggregated search (Google Books + Open Library) |
| POST | `/preview-click` | protect | Track preview click |
| GET | `/explore` | optional | Global catalogue |
| GET | `/` | optional | User library (merged external + uploaded) |
| GET | `/:id` | optional | Single book |
| GET | `/user-external-ids` | protect | External IDs for library context |
| POST | `/add-external` | protect | Add external book to library |
| POST | `/` | protect | Create book |
| POST | `/:id/add-to-library` | protect | Add to library |
| PUT | `/:id` | protect | Update book |
| DELETE | `/:id` | protect | Delete book |

### Book Requests (`/book-requests`)

| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/` | protect | user |
| GET | `/pending` | protect | admin |
| POST | `/:id/approve` | protect | admin |
| POST | `/:id/reject` | protect | admin |
| DELETE | `/:id` | protect | admin |

### Admin (`/admin`)

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/stats` | protect | admin |
| GET | `/users` | protect | admin |
| GET | `/audit-logs` | protect | admin |
| PATCH | `/users/:id/toggle-ban` | protect | admin |

### Reader (`/reader`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | protect | PDF upload (Multer → Cloudinary) |
| POST | `/session` | protect | Create reading session |
| GET | `/progress` | protect | Get progress (query: bookId) |
| PATCH/POST | `/progress` | protect | Update progress |
| GET | `/dashboard/stats` | protect | Dashboard stats |
| GET | `/dashboard/streak` | protect | Streak data |
| GET | `/dashboard/activity` | protect | Activity data |
| GET | `/dashboard/feed` | protect | Activity feed |
| GET | `/dashboard/recommendations` | protect | Recommendations |
| GET | `/goals` | protect | Goals summary |
| POST | `/goals` | protect | Upsert goal |
| GET | `/:bookId` | protect | Uploaded book metadata |

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API status, CORS info, cookies present |

---

## 8. Security Features

| Feature | Implementation |
|---------|----------------|
| **JWT Access Token** | Short-lived (15 min), Bearer header, in-memory on client |
| **Refresh Token** | HttpOnly cookie, 7 days, rotation with reuse detection |
| **Password Hashing** | bcrypt, factor 12 |
| **Helmet** | Security headers, cross-origin resource policy |
| **CORS** | Whitelist of origins, credentials: true |
| **NoSQL Injection** | express-mongo-sanitize |
| **XSS** | xss-clean |
| **Input Validation** | express-validator on auth routes |
| **Body Size Limit** | 10kb for JSON |
| **Rate Limiting** | See table below |
| **File Upload** | Multer, 20MB, PDF only, Cloudinary storage |

### Rate Limits

| Limiter | Window | Max (prod) | Applied To |
|---------|--------|------------|------------|
| apiLimiter | 15 min | 1000 | All auth routes |
| loginLimiter | 15 min | AUTH_RATE_LIMIT_MAX (default 5) | login, google |
| registerLimiter | 15 min | AUTH_RATE_LIMIT_MAX | register |
| authLimiter | 15 min | 100 | refresh, logout, me |
| searchLimiter | 1 min | 60 | book search |
| adminRateLimiter | 15 min | 50 | Admin routes |

### Cookie Configuration

- **HttpOnly**: Prevents XSS access
- **Secure**: In production
- **SameSite**: `none` for cross-site (Vercel + separate API)
- **COOKIE_DOMAIN**: Optional for cross-domain setups

---

## 9. Frontend Features

### Pages

| Route | Component | Protection | Description |
|-------|-----------|------------|-------------|
| `/` | Redirect | — | To dashboard or login |
| `/login` | Login | Guest only | Email/password + Google |
| `/register` | Register | Guest only | Registration form |
| `/dashboard` | Dashboard | Protected | BookTracker (main app) |
| `/explore` | Explore | Public | Browse/search books |
| `/upload` | UploadPage | Protected | PDF upload |
| `/reader/:bookId` | Reader | Protected | PDF reader |
| `/admin` | AdminLayout | Admin only | Admin panel |
| `/admin/requests` | AdminRequests | Admin | Book request management |
| `/admin/users` | AdminUsers | Admin | User management |
| `/admin/books` | AdminBooks | Admin | Book catalogue |
| `/admin/analytics` | AdminAnalytics | Admin | Analytics |

### Dashboard (BookTracker)

- **Header**: Search, add book, theme toggle, logout
- **StreakTracker**: Current/longest streak, weekly view
- **StatsPanel**: Books read, pages read, etc.
- **ReadingCharts**: Visual charts (Recharts)
- **ReadingHeatmap**: Activity heatmap
- **LibraryBookCard**: Book cards with status, progress
- **BookModal, AddBookModal, EditBookModal**: CRUD modals
- **WordCloud**: Genre visualization
- **SuggestedBooks**: Recommendations
- **ReadingActivityFeed**: Recent activity

### Context & State

- **AuthContext**: user, login, logout, register, Google login
- **LibraryContext**: External book IDs for search UX
- **ToastContext**: Global toasts

### Route Guards

- **ProtectedRoute**: Redirects to login if unauthenticated
- **AdminProtectedRoute**: Redirects if not admin

---

## 10. Deployment Details

### Frontend (Vercel)

- **Config**: `vercel.json` rewrites all routes to `index.html` (SPA)
- **Build**: `vite build`
- **Env**: `VITE_API_URL` for backend API URL

### Backend

- **Recommended**: Render, Railway, or similar (Node.js runtime)
- **Env**: See `backend/.env.example` for required variables
- **No Docker** configuration in repo

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default 5000) |
| NODE_ENV | No | development / production |
| MONGO_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes | JWT signing secret |
| JWT_ACCESS_EXPIRE | No | Access token TTL (default 15m) |
| REFRESH_TOKEN_EXPIRE_DAYS | No | Refresh TTL (default 7) |
| REFRESH_TOKEN_COOKIE_NAME | No | Cookie name |
| FRONTEND_URL | Yes | Primary frontend origin |
| CORS_ORIGIN | No | Extra CORS origins (comma-separated) |
| AUTH_RATE_LIMIT_MAX | No | Auth rate limit (default 5) |
| GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | For Google | OAuth credentials |
| GOOGLE_BOOKS_API_KEY | No | Google Books API (optional) |
| CLOUDINARY_* | For upload | Cloudinary credentials |

---

## 11. Future Improvements

| Area | Suggestion |
|------|------------|
| **Caching** | Redis for search/explore responses (placeholder exists) |
| **Testing** | Unit tests (Vitest), E2E (Playwright/Cypress) |
| **Docker** | docker-compose for local dev and deployment |
| **API Docs** | OpenAPI/Swagger documentation |
| **Notifications** | In-app or email for request status, goals |
| **Mobile** | React Native or PWA for mobile reading |
| **Social** | Sharing reading lists, friend activity |
| **Accessibility** | ARIA labels, keyboard navigation, screen reader support |
| **Offline** | Service worker for cached reading |
| **Analytics** | Server-side analytics (e.g., PostHog) |

---

*Documentation generated for BookT project. Suitable for resume, portfolio, GitHub, and presentations.*
