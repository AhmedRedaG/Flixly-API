/**
 * AUTH ENDPOINTS
 */
// POST /api/auth/register
// Body: { first_name, last_name, username, email, password }
// Response: { user, access_token, refresh_token }

// POST /api/auth/login
// Body: { email/username, password }
// Response: { user, access_token, refresh_token }

// POST /api/auth/google
// Body: { google_token }
// Response: { user, access_token, refresh_token }

// POST /api/auth/refresh
// Body: { refresh_token }
// Response: { access_token, refresh_token }

// POST /api/auth/logout
// Headers: Authorization: Bearer {token}
// Response: { message: "Logged out successfully" }

// POST /api/auth/forgot-password
// Body: { email }
// Response: { message: "Reset link sent" }

// POST /api/auth/reset-password
// Body: { token, new_password }
// Response: { message: "Password reset successfully" }

// POST /api/auth/verify-email
// Body: { token }
// Response: { message: "Email verified" }
