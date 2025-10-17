# Boardmate Backend API

Backend server for Boardmate - A comprehensive boarding house management system built with MERN stack.

## Features

### Authentication System
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin/Staff)
- ✅ User profile management
- ✅ Password update functionality
- ✅ Account archiving
- ✅ Input validation and sanitization
- ✅ Rate limiting for security

### Security Features
- JWT token authentication
- Password encryption
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting
- Error handling middleware

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

## Project Structure

```
Backend/
├── controllers/
│   └── authController.js      # Authentication logic
├── middleware/
│   ├── auth.js               # Authentication middleware
│   ├── validation.js         # Input validation
│   └── errorHandler.js       # Global error handling
├── models/
│   └── User.js               # User model with schema
├── routes/
│   └── authRoutes.js         # Authentication routes
├── utils/
│   ├── AppError.js           # Custom error class
│   └── catchAsync.js         # Async error handler
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
└── server.js                # Main server file
```

## Installation

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the Backend directory and configure:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/boardmate
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
BCRYPT_SALT_ROUNDS=12
CLIENT_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Public Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Protected Routes (Require Authentication)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update user password
- `DELETE /api/auth/archive` - Archive user account

### Other Routes
- `GET /api/health` - Health check endpoint

## API Usage Examples

### Register User
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "admin"
}
```

### Login User
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Get Current User (Protected)
```javascript
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

### Update User Details (Protected)
```javascript
PUT /api/auth/updatedetails
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

### Update Password (Protected)
```javascript
PUT /api/auth/updatepassword
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

## Response Format

### Success Response
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "isArchived": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "Error message here",
  "details": [] // Validation errors if any
}
```

## User Model Schema

```javascript
{
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // Excluded from queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'admin',
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  }
}
```

## Validation Rules

### Registration
- **Name**: 3-30 characters, alphanumeric and spaces only
- **Email**: Valid email format
- **Password**: Minimum 6 characters, must contain uppercase, lowercase, and number
- **Role**: Must be 'admin' or 'staff'

### Login
- **Email**: Valid email format
- **Password**: Required

### Update Details
- **Name**: 3-30 characters, alphanumeric and spaces only (optional)
- **Email**: Valid email format (optional)

### Update Password
- **Current Password**: Required
- **New Password**: Same rules as registration password
- **Confirm Password**: Must match new password

## Middleware

### Authentication (`auth.js`)
- `protect` - Requires valid JWT token
- `authorize(...roles)` - Requires specific user roles
- `adminOnly` - Admin access only
- `optionalAuth` - Optional authentication (doesn't fail if no token)

### Validation (`validation.js`)
- Input validation using express-validator
- Sanitization and normalization
- Custom validation rules

### Error Handling (`errorHandler.js`)
- Global error handling
- Mongoose error transformation
- JWT error handling
- Development vs production error responses

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Environment Variables
Make sure to set up all required environment variables in your `.env` file before running the server.

### Security Considerations
1. Change the JWT_SECRET in production
2. Use HTTPS in production
3. Set appropriate CORS origins
4. Consider using refresh tokens for enhanced security
5. Implement rate limiting based on your needs
6. Regular security audits and dependency updates

## Database Connection
The server automatically connects to MongoDB using the URI specified in the environment variables. Make sure MongoDB is running and accessible.

## Error Handling
The API includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- JWT token errors
- General server errors

All errors are returned in a consistent JSON format with appropriate HTTP status codes.