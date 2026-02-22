# Admin Panel Visibility — Root Cause & Fixes

## Summary of fixes

1. **Backend — JWT payload now includes role**  
   - `tokenUtils.signAccessToken(userId, role)` now signs `{ id, role }`.  
   - Login and refresh both pass `user.role` when issuing the access token.

2. **Backend — /auth/me**  
   - Returns `{ status: "success", data: { user } }` with user as a plain object.  
   - User includes `_id`, `name`, `email`, `role` (password never returned).  
   - No `.select()` that would exclude `role`.

3. **Frontend — AuthContext**  
   - `loadUser()` sets `setUser(meRes.data?.data?.user ?? meRes.data?.user ?? null)`.  
   - Temporary debug in development: `console.log('AuthContext user:', { id, name, role })` when `user` changes.

4. **Frontend — AdminProtectedRoute**  
   - Order: `loading` → spinner; `!user` → redirect to login; `user.role !== 'admin'` → redirect to dashboard; else render children.  
   - Role check is case-insensitive: `String(user.role).toLowerCase() !== 'admin'` so both `"admin"` and `"Admin"` in DB work.

5. **Frontend — Header Admin link**  
   - Condition: `String(user?.role).toLowerCase() === 'admin'`.  
   - Temporary debug in development: `console.log('Header user role:', user?.role)` when `user?.role` changes.

---

## Why re-login is required after changing role in MongoDB

- The **access token** is a JWT that is created at **login** (and on **refresh**).  
- Its payload now includes `id` and **role** and is valid until it expires (e.g. 15 minutes).  
- The frontend does **not** decode the JWT; it gets the current user from:
  - **Login/register:** `data.user` from the response.  
  - **Session restore:** `GET /auth/me` after refresh (backend uses the new token and loads the user from the DB).  
- So after a **refresh**, the backend loads the user from the DB and returns them from `/auth/me`, so the **latest** role from the DB is used.  
- If the user never triggers a refresh (e.g. they stay on the app with an old token and never hit refresh), the in-memory `user` was set at last login/loadUser.  
- If you **manually change `role` in MongoDB** and the user was already logged in:
  - Their **refresh token** is still valid.  
  - On the **next** page reload (or next API call that triggers refresh), `loadUser()` runs: refresh → then `GET /auth/me` → backend returns the **updated** user (with new role) → frontend `setUser(...)` → Admin link and `/admin` should work.  
- So in theory, **no re-login is required** if the user refreshes the page or triggers a token refresh, because `/auth/me` always returns the current DB user (including role).  
- If the Admin link still does not appear:
  - **Force a full re-login:** logout (clears in-memory user and refresh cookie), then login again.  
  - That way the frontend gets a new `data.user` (with role) and a new token; no stale state.

---

## DB validation

Ensure at least one user has the admin role in MongoDB:

```js
// In MongoDB shell or Compass, check:
db.users.findOne({ role: "admin" })

// Role must be exactly lowercase "admin" (or use the case-insensitive checks in the app).
// To set a user as admin:
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

After changing role in the DB, have the user **log out and log in again** (or at least refresh the page so `loadUser` runs and fetches `/auth/me` with the new role).

---

## Removing debug logs

After the Admin panel is confirmed working, remove or guard the temporary logs:

- `AuthContext.jsx`: remove the `useEffect` that logs `AuthContext user:`.
- `Header.jsx`: remove the `useEffect` that logs `Header user role:`.
