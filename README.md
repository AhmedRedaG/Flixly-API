# JWT Authentication API

A robust and secure authentication system built with Node.js and Express, featuring JWT (JSON Web Token) based authentication with refresh token rotation. This API provides a complete authentication and authorization solution that can be easily integrated into any REST API project.

## Features

- 🔐 Secure JWT-based authentication with dual token system
- 🔄 Refresh token rotation with multi-device support
- 🚀 Express.js REST API with proper error handling
- 📦 MongoDB integration with Mongoose
- 🔑 Google OAuth 2.0 authentication support
- 📱 Advanced Two-Factor Authentication (2FA):
  - SMS (phone-based) and TOTP (authenticator app) support
  - One-time backup codes for account recovery
  - Method selection and management
  - Lockout and brute-force protection
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
TEMP_TOKEN_SECRET=your_temp_token_secret   # Temp token secret for 2FA
GOOGLE_CLIENT_ID=your_google_client_id     # Google OAuth client ID
GOOGLE_CLIENT_SECRET=your_google_secret    # Google OAuth client secret
SERVER_MAIL=your_email@gmail.com          # Email for sending password reset
SERVER_MAIL_PASS=your_email_app_password  # Email app password for SMTP
FRONTEND_URL=http://your-frontend-url     # Frontend URL for reset password page
VONAGE_API_KEY=your_vonage_key            # SMS provider key
VONAGE_API_SECRET=your_vonage_secret      # SMS provider secret
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
├── app.js
├── package.json
├── .env
├── config/
│   └── passport.js
├── controllers/
│   ├── user.js
│   └── auth/
│       ├── google.js
│       ├── local.js
│       ├── password.js
│       └── tfa/
│           ├── index.js
│           ├── lifecycle.js
│           ├── login.js
│           ├── setup.js
│           └── sms.js
├── middlewares/
│   ├── isAuth.js
│   ├── isValid.js
│   ├── rateLimiter.js
│   ├── requestDurationLogger.js
│   └── tempAuth.js
├── models/
│   └── user.js
├── public/
│   └── mailImages/
│       └── logo.png
├── routes/
│   ├── user.js
│   └── auth/
│       ├── google.js
│       ├── index.js
│       ├── local.js
│       ├── password.js
│       └── tfa.js
├── utilities/
│   ├── cookieHelper.js
│   ├── dbHelper.js
│   ├── jwtHelper.js
│   ├── mailSender.js
│   ├── smsSender.js
│   └── tfaHelper.js
└── README.md
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
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  refreshTokens: [String],
  resetToken: { type: String },
  TFA: {
    status: { type: Boolean, default: false }, // 2FA enabled/disabled
    method: { type: String, enum: ["sms", "totp"], default: null }, // Current 2FA method
    sms: {
      status: { type: Boolean, default: false },
      number: { type: String },
      code: { type: String },
      expiredAt: { type: Date },
      attempts: { type: Number, default: 0 },
      locked: { type: Boolean, default: false },
      lockedUntil: { type: Date },
    },
    totp: {
      status: { type: Boolean, default: false },
      secret: { type: String },
      attempts: { type: Number, default: 0 },
      locked: { type: Boolean, default: false },
      lockedUntil: { type: Date },
    },
    backupCodes: [
      {
        code: { type: String }, // Hashed backup code
        used: { type: Boolean, default: false },
      },
    ],
  },
  timestamps: true,
}
```

## API Base URL

All API endpoints are prefixed with `/api/v1/`

## API Endpoints

### Authentication & 2FA Routes (`/api/v1/auth`)

#### Register a new user

- **POST** `/register`
- **Body:** `{ name, email, password, confirmPassword }`
- **Validation:**
  - Name: 3-256 characters, letters and spaces only
  - Email: Valid email format
  - Password: Strong password requirements (uppercase, lowercase, number, special character)
  - Confirm Password: Must match password
- Creates a new user account

#### Login (Step 1)

- **POST** `/login`
- **Body:** `{ email, password }`
- **Response:**
  - If 2FA enabled: `{ tempToken }` (use `/2fa/request` and `/2fa/verify`)
  - If not: `{ accessToken, user }`

#### Google OAuth Authentication

- **GET** `/google`
- Initiates Google OAuth flow
- Redirects to Google login page
- No request body needed

#### Google OAuth Callback

- **GET** `/google/callback`
- Handles Google OAuth callback
- Creates/authenticates user
- Sets refresh token in HTTP-only cookie
- Returns access token and user data

#### Request Password Reset

- **POST** `/reset-password`
- **Body:** `{ "email": "string" }`
- Sends password reset link to email
- Rate limited for security
- Returns success message when email is sent

#### Reset Password with Token

- **PATCH** `/reset-password/:resetToken`
- **Params:** `resetToken` from email link
- **Body:** `{ "password": "string" }`
- Validates reset token (1-hour expiration)
- Checks if token was already used
- Updates password and invalidates all refresh tokens
- Returns success message

#### Change Password (Authenticated)

- **PATCH** `/change-password`
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

#### 2FA Setup & Management

- **PUT** `/2fa/setup/sms` (set phone number for SMS 2FA)
- **PUT** `/2fa/setup/totp` (generate TOTP secret)
- **POST** `/2fa/setup/verify` (verify code for SMS or TOTP setup)
- **DELETE** `/2fa/setup/remove` (remove SMS or TOTP setup)
- **POST** `/2fa/enable` (enable 2FA after verifying code, returns backup codes)
- **DELETE** `/2fa/disable` (disable 2FA after verifying code)
- **POST** `/2fa/backup-codes` (regenerate backup codes, verify code)
- **POST** `/2fa/method` (get current 2FA method)
- **POST** `/2fa/request` (send SMS code, must be authenticated)
- **POST** `/2fa/temp-request` (send SMS code, with tempToken)
- **POST** `/2fa/verify` (with tempToken, verify code or backup code, returns access/refresh tokens)

#### Refresh Token

- **POST** `/refresh`
- **Cookies:** Required refresh token
- Issues new access token
- Rotates refresh token
- Maintains last 5 refresh tokens only

#### Logout

- **DELETE** `/logout`
- **Cookies:** Required refresh token
- **Query Params:** `full=true` (optional, logs out from all devices)
- Invalidates refresh token(s)
- Clears refresh token cookie

### Protected Routes (`/api/v1/user`)

#### Get User Data

- **GET** `/user`
- **Headers:** `Authorization: Bearer <access_token>`
- Returns the current user's data
- Protected by JWT authentication middleware

## Security Features

1. **Two-Factor Authentication (2FA)**

   - SMS-based 2FA with phone verification
   - TOTP (authenticator app) 2FA support
   - One-time backup codes for account recovery
   - Method selection and management
   - Attempts tracking, lockout, and brute-force protection

2. **Complete Token Management**

   - Access Token: 2 hours expiration (configurable)
   - Refresh Token: 7 days expiration
   - Temp Token: 10 minutes expiration (for 2FA)
   - Token rotation and multi-device support
   - Selective logout (single device or all devices)
   - Automatic token cleanup and management

3. **HTTP-only Cookie Management**

   - Refresh tokens in HTTP-only cookies
   - Environment-based security settings:
     - Strict SameSite in production
     - Secure flag in production
     - Path-restricted to `/api/v1/auth`
   - 7-day cookie expiration
   - Protected against XSS attacks

4. **Rate Limiting Protection**

   - 5 attempts per 15-minute window (configurable)
   - Applies to all authentication and 2FA endpoints
   - Standardized error messages
   - Protection against brute force and abuse

5. **Input Validation & Sanitization**

   - Name: 3-256 characters, letters and spaces
   - Email: Validation and normalization
   - Password: Strong password requirements, max 64 chars
   - Phone: International format validation
   - Password confirmation matching

6. **Token Verification & Authorization**

   - Bearer, refresh, reset, and temp token validation
   - Proper token expiration handling
   - Clear error messages for missing/invalid/expired tokens

7. **Additional Security Measures**
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

### Login (with 2FA enabled)

```javascript
// Step 1: Login Request
fetch("http://your-api/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "ahmed@example.com",
    password: "StrongPass123!",
  }),
});
// Response if 2FA enabled:
// { status: 'fail', data: { tempToken: '...', phoneNumber: '+201234567890' } }

// Step 2: Request SMS code (if using SMS)
fetch("http://your-api/api/v1/auth/2fa/temp-request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tempToken }),
});

// Step 3: Verify 2FA code (SMS or TOTP)
fetch("http://your-api/api/v1/auth/2fa/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tempToken, method: "sms", TFACode: "123456" }),
});
// or for TOTP:
// body: JSON.stringify({ tempToken, method: 'totp', TFACode: '123456' })
// or for backup code:
// body: JSON.stringify({ tempToken, method: 'backup', backupCode: 'xxxx-xxxx' })

// Response:
// { status: 'success', data: { accessToken, user } }
```

### 2FA Setup (SMS)

```javascript
// Set phone number
fetch("http://your-api/api/v1/auth/2fa/setup/sms", {
  method: "PUT",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
  body: JSON.stringify({ phoneNumber: "+201234567890" }),
});
// Verify code
fetch("http://your-api/api/v1/auth/2fa/setup/verify", {
  method: "POST",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
  body: JSON.stringify({ method: "sms", TFACode: "123456" }),
});
// Enable 2FA
fetch("http://your-api/api/v1/auth/2fa/enable", {
  method: "POST",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
  body: JSON.stringify({ method: "sms", TFACode: "123456" }),
});
```

### 2FA Setup (TOTP)

```javascript
// Generate TOTP secret
fetch("http://your-api/api/v1/auth/2fa/setup/totp", {
  method: "PUT",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
});
// Verify code
fetch("http://your-api/api/v1/auth/2fa/setup/verify", {
  method: "POST",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
  body: JSON.stringify({ method: "totp", TFACode: "123456" }),
});
// Enable 2FA
fetch("http://your-api/api/v1/auth/2fa/enable", {
  method: "POST",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
  body: JSON.stringify({ method: "totp", TFACode: "123456" }),
});
```

### Using Backup Codes

```javascript
// During login 2FA verification
fetch("http://your-api/api/v1/auth/2fa/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tempToken,
    method: "backup",
    backupCode: "xxxx-xxxx",
  }),
});
// Response: { status: 'success', data: { accessToken, user } }
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
