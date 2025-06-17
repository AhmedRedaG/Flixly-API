# JWT Authentication API

A robust and secure authentication system built with Node.js and Express, featuring JWT (JSON Web Token) based authentication with refresh token rotation. This API provides a complete authentication and authorization solution that can be easily integrated into any REST API project.

## Features

- 🔐 Secure JWT-based authentication with dual token system
- 🔄 Refresh token rotation with multi-device support
- 🚀 Express.js REST API with proper error handling
- 📦 MongoDB integration with Mongoose
- 🔑 Google OAuth 2.0 authentication support
- 📧 Password reset with email verification
- 🔒 Advanced password validation and security
- 🛡️ Sophisticated rate limiting protection
- 🍪 Environment-aware HTTP-only cookie configuration
- ✨ Comprehensive input validation and sanitization
- 🚫 Protection against common security vulnerabilities

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (JWT)
- Passport.js with Google OAuth 2.0
- Nodemailer
- bcrypt
- Cookie Parser
- Express Rate Limit
- Express Validator
- JSend Middleware
- Helmet
- CORS
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
PORT=3000                                  # Server port (default: 3000)
MONGODB_URI=your_mongodb_connection_string # MongoDB connection string
ACCESS_TOKEN_SECRET=your_secret_key        # JWT access token secret
REFRESH_TOKEN_SECRET=your_secret_key       # JWT refresh token secret
RESET_TOKEN_SECRET=your_secret_key         # Password reset token secret
GOOGLE_CLIENT_ID=your_google_client_id     # Google OAuth client ID
GOOGLE_CLIENT_SECRET=your_google_secret    # Google OAuth client secret
SERVER_MAIL=your_email@gmail.com          # Email for sending password reset
SERVER_MAIL_PASS=your_email_app_password  # Email app password for SMTP
FRONTEND_URL=http://your-frontend-url     # Frontend URL for reset password page
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
├── config/
│   └── passport.js       # Passport OAuth configuration
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
    ├── JwtHelper.js      # JWT helper class
    ├── CookieHelper.js   # Cookies helper class
    └── mailSender.js     # sending mail functions
```

## Database Schema

### User Model

```javascript
{
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String }, // Optional for OAuth users
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
  role: { type: String, default: "user" },
  refreshTokens: [String], // Store active refresh tokens
  resetToken: { type: String }, // For password reset functionality
  timestamps: true // Automatically adds createdAt and updatedAt
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

#### Google OAuth Authentication

- **GET** `/auth/google`
- Initiates Google OAuth flow
- Redirects to Google login page
- No request body needed

#### Google OAuth Callback

- **GET** `/auth/google/callback`
- Handles Google OAuth callback
- Creates/authenticates user
- Sets refresh token in HTTP-only cookie
- Returns access token and user data

#### Request Password Reset

- **POST** `/auth/request-password-reset`
- **Body:** `{ "email": "string" }`
- Sends password reset link to email
- Rate limited for security
- Returns success message when email is sent

#### Reset Password with Token

- **PATCH** `/auth/reset-password/:resetToken`
- **Params:** `resetToken` from email link
- **Body:** `{ "password": "string" }`
- Validates reset token (1-hour expiration)
- Checks if token was already used
- Updates password and invalidates all refresh tokens
- Returns success message

#### Change Password (Authenticated)

- **PATCH** `/auth/change-password`
- **Headers:** `Authorization: Bearer <access_token>`
- **Body:**
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- Verifies old password
- Updates to new password
- Invalidates all refresh tokens
- Returns success message

#### Refresh Token

- **POST** `/auth/refresh`
- **Cookies:** Required refresh token
- Issues new access token
- Rotates refresh token
- Maintains last 5 refresh tokens only

#### Logout

- **POST** `/auth/logout`
- **Cookies:** Required refresh token
- **Query Params:** `full=true` (optional, logs out from all devices)
- Invalidates refresh token(s)
- Clears refresh token cookie

### Protected Routes (`/api/v1`)

#### Get User Data

- **GET** `/api/v1/user`
- **Headers:** `Authorization: Bearer <access_token>`
- Returns the current user's data
- Protected by JWT authentication middleware

## Security Features

1. **Complete Token Management**

   - Access Token: 15 minutes expiration
   - Refresh Token: 7 days expiration
   - Token rotation on every refresh
   - Multi-device support (stores last 5 tokens)
   - Selective logout (single device or all devices)
   - Automatic token cleanup and management

2. **HTTP-only Cookie Management**

   - Refresh tokens in HTTP-only cookies
   - Environment-based security settings:
     - Strict SameSite in production
     - Secure flag in production
     - Path-restricted to `/api/v1/auth`
   - 7-day cookie expiration
   - Protected against XSS attacks

3. **Rate Limiting Protection**

   - 5 attempts per 15-minute window
   - Applies to all authentication endpoints
   - Standardized error messages
   - Protection against brute force

4. **Input Validation & Sanitization**

   - Name: 3-256 characters, letters and spaces
   - Email: Validation and normalization
   - Password:
     - Strong password requirements
     - Maximum length of 64 characters
     - Special characters required
   - Password confirmation matching

5. **Token Verification & Authorization**

   - Bearer token format validation
   - Proper token expiration handling
   - Clear error messages for:
     - Missing authorization
     - Invalid token format
     - Expired tokens
     - Invalid tokens

6. **Additional Security Measures**
   - CORS protection
   - Helmet security headers
   - Express security best practices
   - JSend response standardization
   - MongoDB best practices
   - Environment-based configuration

## Error Handling

The API implements consistent error handling with jsend format and appropriate HTTP status codes:

- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Invalid credentials, Missing authorization header)
- `403` - Forbidden (Invalid/Expired token)
- `409` - Conflict (Email already exists)
- `422` - Unprocessable Entity (Validation failed)
- `429` - Too Many Requests (Rate limit exceeded with 15-minute window)
- `500` - Internal Server Error

All error responses follow the jsend format:

```json
{
  "status": "error",
  "message": "error message"
}

{
  "status": "fail",
  "data": {
    "field": "failure message"
  }
}
```

Success responses:

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

## Usage Examples

### Registration

```javascript
// Register Request
fetch('http://your-api/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Ahmed Reda",
    email: "ahmed@example.com",
    password: "StrongPass123!",
    confirmPassword: "StrongPass123!"
  })
});

// Response
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Ahmed Reda",
      "email": "ahmed@example.com",
      "role": "user"
    }
  }
}
```

### Login

```javascript
// Login Request
fetch('http://your-api/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'ahmed@example.com',
    password: 'StrongPass123!'
  })
});

// Response
{
  "status": "success",
  "data": {
    "accessToken": "your_access_token",
    "user": {
      "_id": "user_id",
      "name": "Ahmed Reda",
      "email": "ahmed@example.com",
      "role": "user"
    }
  }
}
// Note: Refresh token is set in HTTP-only cookie
```

### Protected Route Access

```javascript
// Accessing Protected Route
fetch('http://your-api/api/v1/user', {
  headers: {
    'Authorization': 'Bearer your_access_token'
  }
});

// Response
{
  "status": "success",
  "data": {
    // Response data
  }
}
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
