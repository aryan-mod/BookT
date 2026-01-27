# Quick Start Guide

Get your Book Tracker backend running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be v14+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/booktracker
JWT_SECRET=generateARandomSecretKeyHere123456789
NODE_ENV=development
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux with systemd
sudo systemctl start mongod

# Check if running
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update MONGO_URI in .env:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/booktracker
   ```

### 4. Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### 5. Test the API
```bash
# Test root endpoint
curl http://localhost:5000

# Should return: {"message":"Book Tracker API is running"}
```

## Quick API Test

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` for next steps.

### 2. Create a Book
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "pages": 300,
    "genre": ["Fiction"],
    "status": "reading"
  }'
```

### 3. Get All Books
```bash
curl http://localhost:5000/api/books \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues & Solutions

### Issue: MongoDB connection failed
**Solution:**
- Check if MongoDB is running: `mongosh`
- Verify MONGO_URI in .env file
- For local: ensure MongoDB service is started
- For Atlas: check IP whitelist and credentials

### Issue: Port already in use
**Solution:**
- Change PORT in .env to 5001 or another port
- Or kill the process: `lsof -ti:5000 | xargs kill`

### Issue: JWT token invalid
**Solution:**
- Ensure JWT_SECRET is set in .env
- Check Authorization header format: `Bearer <token>`
- Token may be expired (30 day expiry)

### Issue: CORS error from frontend
**Solution:**
- Backend already has CORS enabled
- Check if backend is running
- Verify frontend is calling correct URL

## Next Steps

1. Connect your frontend to this backend
2. Update frontend API calls to use `http://localhost:5000/api`
3. Store JWT token in localStorage after login
4. Add token to all protected requests

## Frontend Integration Example

```javascript
// In your React app
const API_URL = 'http://localhost:5000/api';

// After login/register
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.token);

// For protected routes
const token = localStorage.getItem('token');
const books = await fetch(`${API_URL}/books`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Verify all environment variables are set correctly
- Check server logs for error messages
- Test endpoints with Postman or cURL

Happy coding!
