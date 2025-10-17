# Boardmate Backend API

Backend server for Boardmate - A comprehensive boarding house management system built with MERN stack.

## Features

### Authentication System
- ✅ **Dual Authentication**: Both Users (Admin/Staff) and Tenants
- ✅ User registration and login (Admin/Staff)
- ✅ Tenant registration and login with comprehensive profile
- ✅ Universal login endpoint (works for both users and tenants)
- ✅ JWT-based authentication with user type identification
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin/Staff/Tenant)
- ✅ User and tenant profile management
- ✅ Password update functionality
- ✅ Account archiving for both user types
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
│   ├── User.js               # User model (Admin/Staff)
│   └── Tenant.js             # Tenant model with comprehensive profile
├── routes/
│   ├── authRoutes.js         # Main authentication routes
│   └── tenantRoutes.js       # Tenant-specific routes
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
- `POST /api/auth/register` - Register a new user (Admin/Staff)
- `POST /api/auth/login` - Login user (Admin/Staff)
- `POST /api/auth/universal-login` - Universal login (Users & Tenants)
- `POST /api/auth/tenant/register` - Register a new tenant
- `POST /api/auth/tenant/login` - Login tenant

#### Shared Protected Routes (Users & Tenants)
- `POST /api/auth/logout` - Logout user/tenant
- `GET /api/auth/me` - Get current user/tenant profile

#### User-Only Protected Routes (Admin/Staff)
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update user password
- `DELETE /api/auth/archive` - Archive user account

#### Tenant-Only Protected Routes
- `GET /api/auth/tenant/me` - Get tenant profile with room info
- `PUT /api/auth/tenant/updatedetails` - Update tenant details
- `PUT /api/auth/tenant/updatepassword` - Update tenant password
- `DELETE /api/auth/tenant/archive` - Archive tenant account

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

### Register Tenant
```javascript
POST /api/auth/tenant/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Tenant123",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1995-05-15",
  "occupation": "Software Developer",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "province": "Province",
    "zipCode": "12345"
  },
  "idType": "drivers_license",
  "idNumber": "DL123456789",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Sister",
    "phoneNumber": "+0987654321"
  }
}
```

### Login Tenant
```javascript
POST /api/auth/tenant/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Tenant123"
}
```

### Universal Login (Users & Tenants)
```javascript
POST /api/auth/universal-login
Content-Type: application/json

{
  "email": "user-or-tenant@example.com",
  "password": "Password123"
}
```

### Get Tenant Profile (Protected)
```javascript
GET /api/auth/tenant/me
Authorization: Bearer <your-jwt-token>
```

### Update Tenant Details (Protected)
```javascript
PUT /api/auth/tenant/updatedetails
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "occupation": "Senior Developer",
  "address": {
    "street": "456 New St",
    "city": "New City"
  },
  "emergencyContact": {
    "name": "Jane Smith",
    "relationship": "Sister",
    "phoneNumber": "+0987654321"
  }
}
```

## Response Format

### Success Response (User)
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Admin",
      "email": "john@example.com",
      "role": "admin",
      "isArchived": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "userType": "user"
  }
}
```

### Success Response (Tenant)
```javascript
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "_id": "tenant_id",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1995-05-15T00:00:00.000Z",
      "occupation": "Software Developer",
      "address": {
        "street": "123 Main St",
        "city": "Anytown",
        "province": "Province",
        "zipCode": "12345"
      },
      "idType": "drivers_license",
      "idNumber": "DL123456789",
      "emergencyContact": {
        "name": "Jane Doe",
        "relationship": "Sister",
        "phoneNumber": "+0987654321"
      },
      "room": null,
      "tenantStatus": "pending",
      "isArchived": false,
      "isVerified": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "userType": "tenant"
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

## User Model Schema (Admin/Staff)

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
    minlength: 8,
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

## Tenant Model Schema

```javascript
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Optional reference to User who created this tenant
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
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
    select: false,
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^[\+]?[0-9]{10,15}$/, 'Invalid phone number format'],
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        // Must be at least 18 years old
        const today = new Date();
        const age = today.getFullYear() - v.getFullYear();
        return age >= 18;
      },
      message: 'Tenant must be at least 18 years old',
    },
  },
  occupation: { 
    type: String, 
    trim: true, 
    maxlength: 100 
  },
  address: {
    street: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 50 },
    province: { type: String, trim: true, maxlength: 50 },
    zipCode: { type: String, trim: true, maxlength: 10 },
  },
  idType: {
    type: String,
    enum: ['passport', 'drivers_license', 'national_id', 'other'],
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  emergencyContact: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    relationship: { type: String, required: true, trim: true, maxlength: 50 },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[\+]?[0-9]{10,15}$/, 'Invalid emergency contact phone number'],
    },
  },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  leaseStartDate: Date,
  leaseEndDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !this.leaseStartDate || !v || v > this.leaseStartDate;
      },
      message: 'Lease end date must be after start date',
    },
  },
  monthlyRent: { type: Number, min: 0 },
  securityDeposit: { type: Number, min: 0, default: 0 },
  tenantStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  isArchived: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
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

## Tenant Validation Rules

### Tenant Registration
- **First Name**: 2-50 characters, letters and spaces only
- **Last Name**: 2-50 characters, letters and spaces only
- **Email**: Valid email format, unique
- **Password**: Minimum 6 characters, must contain uppercase, lowercase, and number
- **Phone Number**: 10-15 digits, international format accepted
- **Date of Birth**: Must be at least 18 years old
- **Occupation**: Optional, max 100 characters
- **Address**: All fields optional, with character limits
- **ID Type**: Must be one of: passport, drivers_license, national_id, other
- **ID Number**: Required, max 50 characters
- **Emergency Contact Name**: 2-100 characters, letters and spaces only
- **Emergency Contact Relationship**: 2-50 characters
- **Emergency Contact Phone**: 10-15 digits

### Tenant Login
- **Email**: Valid email format
- **Password**: Required

### Tenant Update Details
- **First Name**: Optional, 2-50 characters, letters and spaces only
- **Last Name**: Optional, 2-50 characters, letters and spaces only
- **Phone Number**: Optional, 10-15 digits
- **Occupation**: Optional, max 100 characters
- **Address**: All fields optional, with character limits
- **Emergency Contact**: All fields optional with same validation as registration

### Tenant Update Password
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