# 📚 BookT - Book Tracking & Reading Analytics Platform

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)

**A full-stack MERN application for tracking your reading habits, building a personal library, and visualizing reading analytics.**

[Live Demo](https://booktracker-psi.vercel.app) · [Documentation](./PROJECT_DOCUMENTATION.md) · [Report Bug](https://github.com/aryan-mod/BookT/issues) · [Request Feature](https://github.com/aryan-mod/BookT/issues)

</div>

---

## 📸 Screenshots

<!-- Add your screenshots here - replace placeholder paths with actual images -->
<table>
  <tr>
    <td><strong>Dashboard</strong><br/><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="400"/><br/><em>Reading stats, streak tracker, and library overview</em></td>
    <td><strong>Library</strong><br/><img src="docs/screenshots/library.png" alt="Library" width="400"/><br/><em>Personal library with progress tracking</em></td>
  </tr>
  <tr>
    <td><strong>Reader</strong><br/><img src="docs/screenshots/reader.png" alt="PDF Reader" width="400"/><br/><em>In-browser PDF reader with progress sync</em></td>
    <td><strong>Admin Panel</strong><br/><img src="docs/screenshots/admin.png" alt="Admin" width="400"/><br/><em>User and book request management</em></td>
  </tr>
</table>

> **Screenshot Placeholders:** Add your actual screenshots to `docs/screenshots/` (e.g., `dashboard.png`, `library.png`, `reader.png`, `admin.png`)

---

## ✨ Features

### 🔐 Authentication
- **Email/Password** registration and login
- **Google OAuth** single sign-on
- **JWT** access tokens + HttpOnly refresh cookie (rotation & reuse detection)
- Protected routes with role-based access (user, admin)

### 📖 Library & Reading
- **Add books** from Google Books and Open Library APIs
- **Upload PDFs** (stored in Cloudinary)
- **Track progress** — current page, status (wishlist/reading/completed), ratings
- **In-browser PDF reader** with auto-save progress on close

### 📊 Analytics & Goals
- **Streak tracker** — current and longest reading streaks
- **Reading heatmap** — visualize daily activity
- **Charts** — pages read, books completed over time
- **Activity feed** — recent reading sessions
- **Word cloud** — genre distribution
- **Yearly goals** — set targets and track completion

### 🔍 Discovery
- **Aggregated search** across multiple book APIs
- **Explore** global catalogue
- **Book requests** — users can request new books; admins approve/reject

### 👑 Admin Panel
- **User management** — view users, ban/unban
- **Book requests** — approve or reject submissions
- **Book catalogue** — manage global books
- **Analytics** — platform statistics
- **Audit logs** — admin action history

### 🎨 UX
- **Dark/Light theme** with persistence
- **Responsive design** (Tailwind CSS)
- **Animations** (Framer Motion, GSAP)
- **Toast notifications**
- **Form validation** (Zod, react-hook-form)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite 5, React Router 7, Tailwind CSS, Recharts, Framer Motion, react-pdf |
| **Backend** | Node.js, Express 4, MongoDB, Mongoose 8 |
| **Auth** | JWT, bcrypt, Google OAuth, HttpOnly cookies |
| **Storage** | MongoDB Atlas, Cloudinary (PDFs) |
| **Security** | Helmet, CORS, rate limiting, mongo-sanitize, xss-clean |
| **External APIs** | Google Books API, Open Library API |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   AuthContext│  │LibraryContext│  │ToastContext │  │  Axios Interceptor   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │  (401 → refresh)     │  │
│         │                │                │         └──────────┬──────────┘  │
│         └────────────────┴────────────────┴────────────────────┘             │
│                                    │                                          │
│  Pages: Dashboard | Explore | Reader | Upload | Admin                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │ HTTP (credentials: true)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API (Express)  /api/v1                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│  │   /auth    │  │   /books   │  │/book-req   │  │  /admin    │  │/reader │ │
│  │ register   │  │ search     │  │ approve    │  │ stats      │  │ upload │ │
│  │ login      │  │ library    │  │ reject     │  │ users      │  │ progress│
│  │ google     │  │ add        │  │            │  │ audit      │  │ goals  │ │
│  │ refresh    │  │ update     │  │            │  │ ban        │  │        │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └───┬────┘ │
│        │               │               │               │             │      │
│  ┌─────▼───────────────▼───────────────▼───────────────▼─────────────▼────┐ │
│  │  Middleware: auth (protect, restrictTo) | rate limit | validate       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    MongoDB      │      │   Cloudinary    │      │ Google Books    │
│  User, Book,    │      │   PDF Storage   │      │ Open Library    │
│  Progress, etc. │      │                 │      │ (External APIs) │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### System Architecture (Mermaid)

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite)"]
        A[AuthContext] --> R[Router]
        L[LibraryContext] --> R
        T[ToastContext] --> R
        R --> P1[Dashboard]
        R --> P2[Explore]
        R --> P3[Reader]
        R --> P4[Admin]
    end

    subgraph API["Backend (Express)"]
        Auth[/auth]
        Books[/books]
        Reader[/reader]
        Admin[/admin]
    end

    subgraph Data["Data & Services"]
        MongoDB[(MongoDB)]
        Cloudinary[Cloudinary]
        ExtAPI[Google Books / Open Library]
    end

    Client -->|HTTPS + Credentials| API
    API --> MongoDB
    API --> Cloudinary
    API --> ExtAPI
```

### Folder Structure

```
BookT/
├── src/                    # Frontend (React)
│   ├── api/                # Axios config
│   ├── components/         # UI components
│   ├── context/            # Auth, Toast, Library
│   ├── hooks/              # useBooks, useTheme, etc.
│   ├── pages/              # Route pages
│   └── main.jsx
├── backend/
│   ├── config/             # db, cloudinary, rateLimit
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # auth, validate, security
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # External APIs, cache
│   │   └── utils/          # tokenUtils, AppError, etc.
│   └── server.js
├── vercel.json             # SPA rewrite for deployment
└── package.json
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google OAuth** credentials ([Console](https://console.cloud.google.com/))
- **Cloudinary** account (for PDF uploads)
- **Google Books API Key** (optional, for better search)

### 1. Clone the repository

```bash
git clone https://github.com/aryan-mod/BookT.git
cd BookT
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookt?retryWrites=true
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5174
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret

# Cloudinary (for PDF upload)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Optional
GOOGLE_BOOKS_API_KEY=your_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd ..   # back to root
npm install
```

Create `.env` (optional; defaults to `http://localhost:5000/api/v1`):

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the app

- Frontend: [http://localhost:5174](http://localhost:5174) (or the port Vite shows)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 📡 API Overview

| Group | Endpoint | Methods | Description |
|-------|----------|---------|-------------|
| **Auth** | `/api/v1/auth` | POST | register, login, google, refresh, logout |
| **Auth** | `/api/v1/auth/me` | GET | Current user (protected) |
| **Books** | `/api/v1/books/search` | GET | Aggregated book search |
| **Books** | `/api/v1/books` | GET, POST | Library list, add book |
| **Books** | `/api/v1/books/:id` | GET, PUT, DELETE | Single book CRUD |
| **Reader** | `/api/v1/reader/upload` | POST | PDF upload |
| **Reader** | `/api/v1/reader/progress` | GET, PATCH | Reading progress |
| **Reader** | `/api/v1/reader/dashboard/*` | GET | Stats, streak, activity, goals |
| **Admin** | `/api/v1/admin/*` | GET, PATCH | Stats, users, audit, ban |
| **Book Requests** | `/api/v1/book-requests` | POST, GET | Submit, list pending |
| **Health** | `/api/v1/health` | GET | API status |

Full API details in [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md#7-api-endpoints).

---

## 🔒 Security

- **JWT** access tokens (15 min) + refresh tokens in **HttpOnly** cookies (7 days)
- **bcrypt** password hashing (factor 12)
- **Helmet** security headers
- **Rate limiting** on auth, search, admin
- **NoSQL injection** protection (mongo-sanitize)
- **XSS** protection (xss-clean)
- **CORS** whitelist
- **Input validation** (express-validator)

---

## 📦 Deployment

### Frontend (Vercel)

1. Connect the repo to [Vercel](https://vercel.com)
2. Set `VITE_API_URL` to your production API URL
3. Deploy (Vercel handles the SPA rewrite)

### Backend (Render / Railway / etc.)

1. Create a Node.js service
2. Set environment variables from `backend/.env.example`
3. Point `FRONTEND_URL` and `CORS_ORIGIN` to your frontend URL

---

## 📄 License

ISC License. See [LICENSE](LICENSE) for details.

---

## 👤 Author

**Aryan Kushwaha**

- GitHub: https://github.com/aryan-mod
- LinkedIn: https://linkedin.com/in/aryan-kushwaha-007330302/
- Email: kushwahaaryan1658@gmail.com

---

<div align="center">

**Built with ❤️ using React, Node.js, and MongoDB**

⭐ Star this repo if you find it useful!

</div>
