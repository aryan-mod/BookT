# Book Tracker Backend API

Complete RESTful API backend for the Book Tracker application built with Node.js, Express.js, and MongoDB.

## Features

- User authentication with JWT
- CRUD operations for books
- Protected routes
- MongoDB with Mongoose ODM
- CORS enabled for frontend integration
- Clean and scalable architecture

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── bookController.js     # Book CRUD logic
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   └── errorHandler.js       # Error handling
├── models/
│   ├── User.js              # User schema
│   └── Book.js              # Book schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── bookRoutes.js        # Book endpoints
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js                # Entry point
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Step 1: Clone and Navigate

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/booktracker
JWT_SECRET=your_super_secret_jwt_key_here_change_this
NODE_ENV=development
```

**Important:**
- For local MongoDB: `mongodb://localhost:27017/booktracker`
- For MongoDB Atlas: `mongodb+srv://<username>:<password>@cluster.mongodb.net/booktracker`
- Generate a strong JWT_SECRET (you can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Step 4: Start MongoDB

If using local MongoDB:

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# MongoDB should start automatically or use Services
```

### Step 5: Run the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Books (All routes require authentication)

#### Get All Books
```http
GET /api/books
Authorization: Bearer <token>
```

#### Get Single Book
```http
GET /api/books/:id
Authorization: Bearer <token>
```

#### Create Book
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "cover": "https://example.com/cover.jpg",
  "rating": 4.5,
  "pages": 180,
  "genre": ["Fiction", "Classic"],
  "status": "reading",
  "startDate": "2024-01-15",
  "currentPage": 45,
  "review": "An amazing classic novel",
  "highlights": [],
  "reactions": {}
}
```

#### Update Book
```http
PUT /api/books/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPage": 90,
  "status": "reading"
}
```

#### Delete Book
```http
DELETE /api/books/:id
Authorization: Bearer <token>
```

## Book Schema

```javascript
{
  user: ObjectId,           // Reference to User
  title: String,            // Required
  author: String,           // Required
  cover: String,            // Image URL
  rating: Number,           // 0-5
  pages: Number,
  genre: [String],          // Array of genres
  status: String,           // 'wishlist', 'reading', 'completed'
  startDate: String,
  endDate: String,
  currentPage: Number,
  highlights: [{
    text: String,
    page: Number,
    timestamp: Date
  }],
  review: String,
  reactions: Map            // Emoji reactions
}
```

## Frontend Integration

### Setting Up Axios (in your React frontend)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set token in headers after login
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Example: Get all books
const getBooks = async () => {
  const response = await axios.get(`${API_URL}/books`);
  return response.data;
};
```

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get books (replace TOKEN with actual token)
curl http://localhost:5000/api/books \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Create a new collection
2. Add Authorization header: `Bearer <your_token>`
3. Test each endpoint

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check MONGO_URI in .env file
- For Atlas, ensure IP is whitelisted

### JWT Error

- Verify JWT_SECRET is set in .env
- Check token format: `Bearer <token>`
- Token expires in 30 days

### CORS Error

- Backend allows all origins by default
- Modify cors() in server.js if needed

## Production Deployment

### Environment Variables

Set these on your hosting platform:
- `PORT`
- `MONGO_URI` (use MongoDB Atlas)
- `JWT_SECRET`
- `NODE_ENV=production`

### Recommended Platforms

- Backend: Heroku, Railway, Render, DigitalOcean
- Database: MongoDB Atlas (free tier available)

## Security Best Practices

- Never commit .env file
- Use strong JWT_SECRET
- Use HTTPS in production
- Validate all inputs
- Rate limit API endpoints (consider adding express-rate-limit)
- Keep dependencies updated

## License

MIT
