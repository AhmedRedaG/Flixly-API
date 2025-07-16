# Authentication & Authorization API

A robust and secure authentication system built with Node.js and Express, featuring JWT (JSON Web Token) based authentication with refresh token rotation. This API provides a complete authentication and authorization solution that can be easily integrated into any REST API project.

## API Documentation

The complete API documentation is available at: [SwaggerHub Documentation](https://app.swaggerhub.com/apis-docs/Ahmed-Reda-Freelance/Authentication-Authorization-API/1.0.0)

**Interactive API Documentation**: Access the interactive Swagger UI at `/api/v1/docs` when the server is running.

## Features

- 🔐 Secure JWT-based authentication with dual token system (access & refresh tokens)
- 🔄 Refresh token rotation with multi-device support (last 5 tokens per user)
- 🚀 Express.js REST API with robust error handling (JSend format)
- 📦 MongoDB integration with Mongoose
- 🔑 Google OAuth 2.0 authentication support (Passport.js)
- 📧 **Email verification system** with secure token-based verification
- 📱 Advanced Two-Factor Authentication (2FA):
  - SMS (phone-based, via Vonage) and TOTP (authenticator app, QR code via qrcode/speakeasy)
  - One-time backup codes for account recovery
  - Method selection, management, and removal
  - Attempts tracking, lockout, and brute-force protection
- 📧 Password reset with email verification (secure, token-based)
- 🔒 Advanced password validation and security (strong password policy)
- 🛡️ Sophisticated rate limiting protection (per endpoint)
- 🍪 Environment-aware HTTP-only cookie configuration (secure, SameSite, path-restricted)
- ✨ Comprehensive input validation and sanitization (express-validator)
- 🚫 Protection against common security vulnerabilities (CORS, Helmet, etc.)
- 📊 **Request duration logging** for performance monitoring
- 📚 **Interactive API documentation** with Swagger UI
- 🧪 Comprehensive testing with Jest & Supertest

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JSON Web Tokens (jsonwebtoken)
- Passport.js (Google OAuth 2.0)
- Nodemailer
- bcrypt
- cookie-parser
- express-rate-limit
- express-validator
- jsend-middleware (response standardization)
- helmet
- cors
- dotenv
- @vonage/server-sdk (SMS)
- speakeasy (TOTP 2FA)
- qrcode (QR code for TOTP setup)
- swagger-ui-express (API documentation)
- yamljs (Swagger YAML parsing)
- Jest & Supertest (testing)

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
# Server Configuration
NODE_ENV=development                    # Environment (development/testing/production)
PORT=3000                              # Server port (default: 3000)

# Database Configuration
DEVELOPMENT_MONGODB_URI=your_mongodb_connection_string    # MongoDB connection string for development
TESTING_MONGODB_URI=your_testing_mongodb_connection_string # MongoDB connection string for testing

# JWT Configuration
ACCESS_TOKEN_SECRET=your_secret_key        # JWT access token secret
REFRESH_TOKEN_SECRET=your_secret_key       # JWT refresh token secret
RESET_TOKEN_SECRET=your_secret_key         # Password reset token secret
TEMP_TOKEN_SECRET=your_temp_token_secret   # Temp token secret for 2FA
VERIFY_TOKEN_SECRET=your_verify_token_secret # Email verification token secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id     # Google OAuth client ID
GOOGLE_CLIENT_SECRET=your_google_secret    # Google OAuth client secret

# Email Configuration
SMTP_HOST=smtp.gmail.com                   # SMTP host (default: smtp.gmail.com)
SMTP_PORT=587                              # SMTP port (default: 587)
SERVER_MAIL=your_email@gmail.com          # Email for sending notifications
SERVER_MAIL_PASS=your_email_app_password  # Email app password for SMTP
SUPPORT_MAIL=your_support_email@gmail.com # Support email (optional, defaults to SERVER_MAIL)

# Frontend Configuration
FRONTEND_URL=http://your-frontend-url     # Frontend URL for email links

# SMS Configuration (Vonage)
VONAGE_API_KEY=your_vonage_key            # SMS provider key
VONAGE_API_SECRET=your_vonage_secret      # SMS provider secret
```

4. Start the development server:

```bash
npm run dev
```

## Testing

The project uses **Jest** and **Supertest** for unit and integration testing. Test files are located in the `__test__` directory.

Run all tests using Jest and Supertest:

```bash
npm test
```

## Project Structure

```
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── constants.js
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── index.js
│   │   └── passport.js
│   ├── controllers/
│   │   ├── user.js
│   │   └── auth/
│   │       ├── google.js
│   │       ├── local.js
│   │       ├── password.js
│   │       └── tfa/
│   │           ├── index.js
│   │           ├── lifecycle.js
│   │           ├── login.js
│   │           ├── setup.js
│   │           └── sms.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   ├── isAuth.js
│   │   ├── isValid.js
│   │   ├── rateLimiter.js
│   │   ├── requestDurationLogger.js
│   │   └── swaggerDocs.js
│   ├── models/
│   │   └── user.js
│   ├── public/
│   │   └── mailImages/
│   │       └── logo.png
│   ├── routes/
│   │   ├── user.js
│   │   └── auth/
│   │       ├── google.js
│   │       ├── index.js
│   │       ├── local.js
│   │       ├── password.js
│   │       └── tfa.js
│   ├── services/
│   │   └── auth/
│   │       ├── google.service.js
│   │       ├── local.service.js
│   │       ├── password.service.js
│   │       └── tfa/
│   │           ├── lifecycle.service.js
│   │           ├── login.service.js
│   │           ├── setup.service.js
│   │           └── sms.service.js
│   ├── utilities/
│   │   ├── appError.js
│   │   ├── authHelper.js
│   │   ├── cookieHelper.js
│   │   ├── dataHelper.js
│   │   ├── jwtHelper.js
│   │   ├── smsSender.js
│   │   ├── tfaHelper.js
│   │   └── mailHelper/
│   │       ├── mailSender.js
│   │       ├── mailService.js
│   │       ├── resetPasswordMail.js
│   │       └── verifyAccountMail.js
│   ├── validators/
│   │   ├── fields/
│   │   │   ├── email.js
│   │   │   ├── index.js
│   │   │   ├── name.js
│   │   │   ├── password.js
│   │   │   ├── phoneNumber.js
│   │   │   └── tfa.js
│   │   └── shared/
│   │       └── auth.js
├── public/
│   └── mailImages/
│       └── logo.png
├── __test__/
│   ├── api/
│   │   └── integration.test.js
│   └── utilities/
│       ├── appError.test.js
│       ├── authHelper.test.js
│       ├── jwtHelper.test.js
│       └── tfaHelper.test.js
├── package.json
├── swagger.yaml
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
  verified: { type: Boolean, default: false }, // Email verification status
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
      lastSentAt: { type: Date }, // Rate limiting for SMS
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

All endpoints are prefixed with `/api/v1/`

### Authentication & 2FA (`/api/v1/auth`)

- **POST** `/auth/local/register` — Register a new user
  - Body: `{ name, email, password, confirmPassword }`
  - **New**: Sends verification email automatically
- **PATCH** `/auth/local/verify/:verifyToken` — **New**: Verify email address
  - Verifies user account and returns access/refresh tokens
- **POST** `/auth/local/login` — Login (step 1)
  - Body: `{ email, password }`
  - Response: If 2FA enabled, returns `{ tempToken, phoneNumber? }`; else `{ accessToken, user }`
  - **Updated**: Checks for email verification before login
- **GET** `/auth/google` — Initiate Google OAuth
- **GET** `/auth/google/callback` — Google OAuth callback
- **POST** `/auth/password/reset` — Request password reset (body: `{ email }`)
- **PATCH** `/auth/password/reset/:resetToken` — Reset password with token
- **PATCH** `/auth/password/change` — Change password (auth required)
  - Body: `{ oldPassword, newPassword }`
- **POST** `/auth/refresh` — Refresh access token (requires refresh token cookie)
- **DELETE** `/auth/logout` — Logout (requires refresh token cookie, `full=true` for all devices)

#### 2FA Setup & Management

- **POST** `/auth/2fa/setup/sms` — Set phone number for SMS 2FA
- **POST** `/auth/2fa/setup/totp` — Generate TOTP secret
- **POST** `/auth/2fa/setup` — Verify code for SMS or TOTP setup
- **DELETE** `/auth/2fa/setup/remove` — Remove SMS or TOTP setup
- **POST** `/auth/2fa/enable` — Enable 2FA after verifying code (returns backup codes)
- **DELETE** `/auth/2fa/disable` — Disable 2FA after verifying code
- **POST** `/auth/2fa/backup-codes` — Regenerate backup codes (verify code required)
- **POST** `/auth/2fa/method` — Get current 2FA method
- **POST** `/auth/2fa/request` — Send SMS code (authenticated)
- **POST** `/auth/2fa/temp-request` — Send SMS code (with tempToken)
- **POST** `/auth/2fa/verify` — Verify 2FA code or backup code (with tempToken, returns tokens)

### User (`/api/v1/user`)

- **GET** `/user` — Get current user data (JWT required)

### API Documentation

- **GET** `/docs` — **New**: Interactive Swagger UI documentation

## Security Features

1. **Email Verification System** - **New Feature**

   - Automatic email verification on registration
   - Secure token-based verification (3-hour expiration)
   - Prevents login until email is verified
   - Professional email templates with logo support

2. **Two-Factor Authentication (2FA)**

   - SMS-based 2FA with phone verification
   - TOTP (authenticator app) 2FA support
   - One-time backup codes for account recovery
   - Method selection and management
   - Attempts tracking, lockout, and brute-force protection

3. **Complete Token Management**

   - Access Token: 15 minutes expiration (configurable)
   - Refresh Token: 7 days expiration
   - Temp Token: 10 minutes expiration (for 2FA)
   - Verify Token: 3 hours expiration (for email verification)
   - Token rotation and multi-device support
   - Selective logout (single device or all devices)
   - Automatic token cleanup and management

4. **HTTP-only Cookie Management**

   - Refresh tokens in HTTP-only cookies
   - Environment-based security settings:
     - Strict SameSite in production
     - Secure flag in production
     - Path-restricted to `/api/v1/auth`
   - 7-day cookie expiration
   - Protected against XSS attacks

5. **Rate Limiting Protection**

   - 50 requests per 15-minute window (configurable)
   - Applies to all authentication and 2FA endpoints
   - SMS rate limiting (15-minute cooldown between SMS)
   - Standardized error messages
   - Protection against brute force and abuse

6. **Input Validation & Sanitization**

   - Name: 3-256 characters, letters and spaces
   - Email: Validation and normalization
   - Password: Strong password requirements, max 64 chars
   - Phone: International format validation
   - Password confirmation matching

7. **Token Verification & Authorization**

   - Bearer, refresh, reset, temp, and verify token validation
   - Proper token expiration handling
   - Clear error messages for missing/invalid/expired tokens

8. **Performance Monitoring** - **New Feature**

   - Request duration logging for all endpoints
   - Performance tracking and monitoring capabilities

9. **API Documentation** - **New Feature**

   - Interactive Swagger UI at `/api/v1/docs`
   - Complete API specification with examples
   - Request/response schemas and validation

10. **Additional Security Measures**
    - CORS protection
    - Helmet security headers
    - Express security best practices
    - JSend response standardization
    - MongoDB best practices
    - Environment-based configuration

## Error Handling

The API implements consistent error handling with jsend format and appropriate HTTP status codes:

- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Invalid credentials, Missing authorization header, Unverified account)
- `403` - Forbidden (Invalid/Expired token)
- `409` - Conflict (Email already exists, User already verified)
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

### Registration with Email Verification

```javascript
// Register Request
fetch('http://your-api/api/v1/auth/local/register', {
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
    "userSafeData": {
      "_id": "user_id",
      "name": "Ahmed Reda",
      "email": "ahmed@example.com",
      "role": "user"
    },
    "message": "Email sent successfully"
  }
}
```

### Email Verification

```javascript
// Verify email with token from email
fetch('http://your-api/api/v1/auth/local/verify/your_verify_token', {
  method: 'PATCH'
});

// Response
{
  "status": "success",
  "data": {
    "accessToken": "your_access_token",
    "userSafeData": {
      "_id": "user_id",
      "name": "Ahmed Reda",
      "email": "ahmed@example.com",
      "role": "user"
    },
    "message": "Email verified successfully"
  }
}
// Note: Refresh token is set in HTTP-only cookie
```

### Login (with email verification check)

```javascript
// Login Request
fetch('http://your-api/api/v1/auth/local/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'ahmed@example.com',
    password: 'StrongPass123!'
  })
});

// Response (if email not verified)
{
  "status": "fail",
  "data": {
    "message": "Account not verified, please check your email for verification link."
  }
}

// Response (if verified and no 2FA)
{
  "status": "success",
  "data": {
    "accessToken": "your_access_token",
    "userSafeData": {
      "_id": "user_id",
      "name": "Ahmed Reda",
      "email": "ahmed@example.com",
      "role": "user"
    },
    "message": "Login successful"
  }
}
// Note: Refresh token is set in HTTP-only cookie
```

### Login (with 2FA enabled)

```javascript
// Step 1: Login Request
fetch("http://your-api/api/v1/auth/local/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "ahmed@example.com",
    password: "StrongPass123!",
  }),
});
// Response if 2FA enabled:
// { status: 'success', data: { method: 'sms', tempToken: '...', message: 'Two-factor authentication required' } }

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
// { status: 'success', data: { accessToken, userSafeData } }
```

### 2FA Setup (SMS)

```javascript
// Set phone number
fetch("http://your-api/api/v1/auth/2fa/setup/sms", {
  method: "POST",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
  body: JSON.stringify({ phoneNumber: "+201234567890" }),
});
// Verify code
fetch("http://your-api/api/v1/auth/2fa/setup", {
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
  method: "POST",
  headers: { Authorization: "Bearer ...", "Content-Type": "application/json" },
});
// Verify code
fetch("http://your-api/api/v1/auth/2fa/setup", {
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
// Response: { status: 'success', data: { accessToken, userSafeData } }
```

## Best Practices Implemented

- Token-based authentication (JWT, refresh, temp, reset, verify tokens)
- Secure password storage (bcrypt)
- Rate limiting (per endpoint, brute-force protection)
- Input validation & sanitization (express-validator)
- Refresh token rotation (multi-device, last 5 tokens)
- Secure cookie usage (HTTP-only, SameSite, Secure, path-restricted)
- Consistent error handling (JSend)
- MongoDB & Mongoose best practices
- Email verification system with professional templates
- Performance monitoring with request duration logging
- Interactive API documentation with Swagger UI

## License

ISC

## Author

Ahmed Reda

---

Feel free to contribute to this project by creating issues or submitting pull requests.
