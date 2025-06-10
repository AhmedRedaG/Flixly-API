# JWT Authentication API

A robust and secure authentication system built with Node.js and Express, featuring JWT (JSON Web Token) based authentication with refresh token rotation. This API provides a complete authentication and authorization solution that can be easily integrated into any REST API project.

## Features

- 🔐 Secure JWT-based authentication
- 🔄 Refresh token rotation for enhanced security
- 🚀 Express.js REST API
- 📦 MongoDB integration with Mongoose
- 🔒 Password hashing with bcrypt
- 🛡️ Rate limiting protection
- 🍪 HTTP-only cookie based refresh token
- ✨ Input validation
- 🚫 Protection against common security vulnerabilities

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT)
- bcrypt
- Cookie Parser
- Express Rate Limit
- Express Validator
- dotenv

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with the following variables:
```env
PORT=8080                                  # Server port (default: 8080)
MONGODB_URI=your_mongodb_connection_string # MongoDB connection string
ACCESS_TOKEN_SECRET=your_secret_key        # JWT access token secret
REFRESH_TOKEN_SECRET=your_secret_key       # JWT refresh token secret
```

4. Start the development server:
```bash
npm start
```

The server uses nodemon for development, which will automatically restart when you make changes.
```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

## Project Structure

```
├── app.js                 # Application entry point
├── controllers/          
│   ├── auth.js           # Authentication controllers
│   └── user.js           # User data controllers
├── middlewares/
│   ├── isAuth.js         # JWT authorization middleware
│   ├── isValid.js        # Input validation middleware
│   └── rateLimiter.js    # Rate limiting middleware
├── models/
│   └── user.js           # User database model
├── routes/
│   ├── auth.js           # Authentication routes
│   └── user.js           # User routes
└── utilities/
    └── authHelper.js     # Authentication helper functions
```

## Database Schema

### User Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  refreshTokens: [String],
  timestamps: true
}
```

## API Base URL

All API endpoints are prefixed with `/api/v1/`

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

#### Register a new user
- **POST** `/api/v1/auth/register`
- **Body:** 
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string"
  }
  ```
- **Validation:**
  - Name: 3-256 characters, letters and spaces only
  - Email: Valid email format
  - Password: Strong password requirements (uppercase, lowercase, number, special character)
  - Confirm Password: Must match password
- Creates a new user account

#### Login
- **POST** `/auth/login`
- **Body:** `{ "email": "string", "password": "string" }`
- Returns access token and sets refresh token cookie

#### Refresh Token
- **POST** `/auth/refresh`
- **Cookies:** Required refresh token
- Issues new access token using refresh token

#### Logout
- **POST** `/auth/logout`
- **Cookies:** Required refresh token
- **Query Params:** `full=true` (optional, logs out from all devices)
- Invalidates refresh token(s)

### Protected Routes (`/api/v1`)

#### Get User Data
- **GET** `/api/v1/user`
- **Headers:** `Authorization: Bearer <access_token>`
- Returns the current user's data
- Protected by JWT authentication middleware

## Security Features

1. **Rate Limiting**
   - Maximum 5 attempts per 15 minutes for authentication routes
   - Protection against brute force attacks
   - Clear error messages with retry timing

2. **Strong Input Validation**
   - Name validation: Letters and spaces only
   - Email validation and normalization
   - Strong password requirements
   - Password confirmation check

3. **Authentication Middleware**
   - Validates JWT tokens on protected routes
   - Proper Bearer token format validation
   - Clear error messages for token issues

4. **Refresh Token Rotation**
   - New refresh token issued with every refresh
   - Old tokens are invalidated

2. **HTTP-only Cookies**
   - Refresh tokens stored in HTTP-only cookies
   - Protected against XSS attacks

3. **Rate Limiting**
   - Protects against brute force attacks
   - Limits repeated requests from same IP

4. **Password Security**
   - Passwords hashed using bcrypt
   - Salted hashing for enhanced security

## Error Handling

The API implements consistent error handling with appropriate HTTP status codes:

- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Invalid credentials)
- `403` - Forbidden (Invalid token)
- `409` - Conflict (Email already exists)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

## Usage Example

```javascript
// Login Request
fetch('http://your-api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Using Access Token
fetch('http://your-api/protected-route', {
  headers: {
    'Authorization': 'Bearer your_access_token'
  }
});
```

## Best Practices Implemented

- Token-based authentication
- Secure password storage
- Rate limiting
- Input validation
- Refresh token rotation
- Secure cookie usage
- Error handling
- MongoDB best practices

## License

ISC

## Author

Ahmed Reda

---

Feel free to contribute to this project by creating issues or submitting pull requests.
