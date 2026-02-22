# Admin Dashboard & Moderated Catalogue — Flow

## Part 1 — Backend (Moderated Catalogue)

### BookRequest model
- **Location:** `backend/src/models/BookRequest.js`
- Fields: `title`, `author`, `pages`, `cover`, `genre`, `description`, `requestedBy` (ref User), `status` (`pending` | `approved` | `rejected`), `reviewedAt`, `reviewedBy`.

### API

| Method | Route | Auth | Role | Description |
|--------|--------|------|------|-------------|
| POST | `/api/v1/book-requests` | Yes | any | Create a book request (user). |
| GET | `/api/v1/book-requests/pending` | Yes | admin | List pending requests. |
| POST | `/api/v1/book-requests/:id/approve` | Yes | admin | Approve → create Book (if not duplicate). |
| POST | `/api/v1/book-requests/:id/reject` | Yes | admin | Reject request. |
| GET | `/api/v1/admin/stats` | Yes | admin | Dashboard counts: totalUsers, totalBooks, pendingRequests, approvedToday. |

### Duplicate check
- On **approve**, backend checks for an existing `Book` with same **title** and **author** (case-insensitive).
- If found: request is marked **rejected**, response is `400` with message that the book already exists.
- If not found: a new `Book` is created and the request is marked **approved**.

### Response format
All success responses use: `{ status: "success", data: { ... } }`.

### Unchanged
- Auth (JWT, refresh, protect, optionalProtect).
- ReadingProgress and book global schema.
- Existing book routes and behaviour.

---

## Part 2 — Frontend

### User flow (Explore)
1. User opens **Explore**.
2. Clicks **Request a book** → dialog opens (shadcn-style Dialog, Framer Motion).
3. Fills form (React Hook Form + Zod: title, author, pages, description).
4. Submits → `POST /book-requests` → success toast → dialog closes.
5. Request is in **pending** until an admin acts.

### Admin flow
1. Admin sees **Admin** in the header (only if `user.role === "admin"`).
2. Clicks **Admin** → **AdminProtectedRoute** checks role → **AdminDashboard** (dark theme).
3. **Sidebar:** Overview, Pending Requests, Approved Books, Users, Analytics (placeholders for last three).
4. **Overview:** Stats cards (Total Users, Total Books, Pending Requests, Approved Today) + Recharts bar chart + **Pending book requests** table.
5. Table: Title, Author, Requested By, Date, Status, Approve / Reject. Row click opens **Request details** drawer (slide-in from right).
6. **Approve** (green) or **Reject** (red): loading spinner, then **optimistic UI** (row removed, no full reload). Approve creates the book in the global catalogue (or returns 400 if duplicate).

### Routing
- `/admin` and `/admin/*` → `AdminProtectedRoute` → `AdminDashboard`.
- `AdminProtectedRoute`: redirects to login if not authenticated, to dashboard if not admin.

### Tech used
- **React 18**, **Tailwind CSS**, **Framer Motion** (page/card/drawer animations, stagger, hover).
- **shadcn-style** components: `src/components/ui/` (Card, Button, Badge, Input, Label, Dialog).
- **Lucide React** icons.
- **React Hook Form + Zod** on Explore “Request a book” form.
- **Recharts** for admin stats bar chart.

### Files added/updated

**Backend**
- `backend/src/models/BookRequest.js` (new)
- `backend/src/controllers/bookRequestController.js` (new)
- `backend/src/controllers/adminController.js` (new)
- `backend/src/routes/bookRequestRoutes.js` (new)
- `backend/src/routes/adminRoutes.js` (new)
- `backend/src/models/index.js` (export BookRequest)
- `backend/src/routes/index.js` (mount book-requests, admin)

**Frontend**
- `src/context/ToastContext.jsx` (new)
- `src/components/ui/Card.jsx`, `Button.jsx`, `Badge.jsx`, `Input.jsx`, `Label.jsx`, `Dialog.jsx` (new)
- `src/components/admin/AdminSidebar.jsx`, `AdminHeader.jsx`, `StatsCard.jsx`, `RequestsTable.jsx`, `RequestDrawer.jsx` (new)
- `src/components/AdminProtectedRoute.jsx` (new)
- `src/pages/AdminDashboard.jsx` (new)
- `src/pages/Explore.jsx` (Request a book dialog + toast)
- `src/App.jsx` (ToastProvider, /admin route, AdminProtectedRoute)
- `src/components/Header.jsx` (Admin link when `user?.role === 'admin'`)

---

## Result

- **User:** Explore → Submit book request → status **Pending**.
- **Admin:** Admin Dashboard → view pending requests (animated table) → Approve → book added to global catalogue (or 400 if duplicate).
- **Global books:** Single source of truth; no duplicate books; moderation is role-based.
