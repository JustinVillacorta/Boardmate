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

### Room Management System
- ✅ **Complete Room CRUD**: Create, read, update, delete rooms
- ✅ **Tenant Assignment**: Assign/remove tenants to/from rooms
- ✅ **Smart Occupancy Tracking**: Automatic capacity and status management
- ✅ **Room Filtering & Search**: Advanced search with multiple filters
- ✅ **Availability Management**: Real-time room availability tracking
- ✅ **Statistics & Analytics**: Room occupancy and revenue statistics
- ✅ **Status Management**: Room status (available, occupied, maintenance, unavailable)
- ✅ **Maintenance Tracking**: Schedule and track room maintenance
- ✅ **Multi-tenant Support**: Rooms can accommodate multiple tenants based on capacity
- ✅ **Lease Management**: Automatic lease information updates during assignment

### Payment Management System
- ✅ **Complete Payment CRUD**: Create, read, update, delete payments
- ✅ **Payment Recording**: Record rent, deposits, utilities, maintenance fees
- ✅ **Receipt Generation**: Generate PDF and HTML receipts
- ✅ **Payment Status Tracking**: Track paid, pending, overdue payments
- ✅ **Receipt Downloads**: Tenants can download their payment receipts
- ✅ **Payment Analytics**: Statistics and reporting for financial tracking
- ✅ **Late Fee Management**: Automatic late fee calculations
- ✅ **Payment Filtering**: Advanced filtering by date, tenant, type, status
- ✅ **Auto Receipt Numbering**: Sequential receipt number generation

### Report Management System (Simplified)
- ✅ **Basic Report CRUD**: Create, read, update, delete reports
- ✅ **Status Change Tracking**: Simple status workflow (pending → in-progress → resolved/rejected)
- ✅ **Maintenance & Complaint Reports**: Two main report types
- ✅ **Tenant Access Control**: Tenants can only see their own reports
- ✅ **Staff Management**: Staff can manage all reports and change statuses
- ✅ **Report Filtering**: Filter by tenant, room, type, status, date range
- ✅ **Search Functionality**: Search reports by title and description

### Notification System
- ✅ **Automated Notifications**: Smart notification system for all activities
- ✅ **Report Notifications**: Alerts when reports are created or status updated
- ✅ **Payment Due Reminders**: Automatic payment due date notifications (7-day, 3-day, overdue)
- ✅ **Lease Expiry Reminders**: Automated lease renewal notifications (30-day, 7-day)
- ✅ **System Announcements**: Admin broadcast messages to all users
- ✅ **Real-time Updates**: Mark as read/unread, notification counts
- ✅ **Scheduled Jobs**: Daily payment reminders and weekly lease alerts
- ✅ **Auto-Expiring**: Notifications clean up automatically after relevance expires
- ✅ **Metadata Rich**: Notifications include relevant context and IDs

### Security Features
- JWT token authentication
- Password encryption
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Rate limiting
- Error handling middleware

## What's Missing / To-Do

### Frontend Development
- ❌ **React Frontend**: Complete frontend application needs to be built
- ❌ **User Interface**: Dashboard, forms, and user management interfaces
- ❌ **Tenant Portal**: Self-service portal for tenants
- ❌ **Admin Dashboard**: Management interface for staff/admin
- ❌ **Real-time Updates**: Socket.io integration for live notifications
- ❌ **Mobile Responsive**: Mobile-friendly design implementation

### Advanced Features
- ❌ **File Upload System**: Image/document upload for rooms, tenants, reports
- ❌ **Email Service**: Email notifications and password reset functionality
- ❌ **SMS Integration**: SMS notifications for urgent updates
- ❌ **Calendar Integration**: Maintenance scheduling and lease tracking
- ❌ **Reporting Dashboard**: Advanced analytics and reporting features
- ❌ **Backup System**: Automated database backup and restore
- ❌ **Multi-Property Support**: Support for multiple boarding house locations

### Integration Features
- ❌ **Payment Gateway**: Online payment processing (Stripe, PayPal, etc.)
- ❌ **QR Code Generation**: QR codes for room access or payments
- ❌ **Digital Contracts**: Electronic lease agreement signing
- ❌ **Accounting Integration**: Integration with accounting software
- ❌ **Background Checks**: Third-party tenant screening integration

### Performance & Scalability
- ❌ **Redis Caching**: Implement caching for better performance
- ❌ **Database Optimization**: Advanced indexing and query optimization
- ❌ **Load Balancing**: Multiple server instance support
- ❌ **CDN Integration**: Content delivery network for file serving
- ❌ **Monitoring**: Application performance monitoring and logging

### Deployment & DevOps
- ❌ **Docker Configuration**: Containerization for easy deployment
- ❌ **CI/CD Pipeline**: Automated testing and deployment
- ❌ **Environment Management**: Staging and production environment setup
- ❌ **SSL/HTTPS**: Security certificate configuration
- ❌ **Domain Setup**: Custom domain and DNS configuration

### Testing
- ❌ **Unit Tests**: Comprehensive test coverage for all modules
- ❌ **Integration Tests**: API endpoint testing
- ❌ **End-to-End Tests**: Complete user flow testing
- ❌ **Performance Tests**: Load and stress testing
- ❌ **Security Tests**: Vulnerability and penetration testing

### Documentation
- ❌ **API Documentation**: Interactive API docs (Swagger/Postman)
- ❌ **User Manual**: End-user documentation
- ❌ **Developer Guide**: Setup and development documentation
- ❌ **Deployment Guide**: Production deployment instructions

### Immediate Next Steps (Priority Order)
1. **Frontend Development** - Build React application
2. **File Upload System** - Enable image/document uploads
3. **Email Service** - Password reset and notifications
4. **Payment Gateway** - Online payment processing
5. **Advanced Analytics** - Reporting dashboard
6. **Testing Suite** - Comprehensive test coverage
7. **Deployment Setup** - Production environment configuration

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
- **pdfkit** - PDF generation for receipts
- **node-cron** - Scheduled jobs for notifications

## Project Structure

```
Backend/
├── controllers/
│   ├── authController.js         # Authentication business logic
│   ├── roomController.js         # Room management logic
│   ├── paymentController.js      # Payment management logic
│   ├── reportController.js       # Report management logic
│   └── notificationController.js # Notification management logic
├── middleware/
│   ├── auth.js                   # Authentication middleware
│   ├── validation.js             # Input validation
│   └── errorHandler.js           # Global error handling
├── models/
│   ├── User.js                   # User model (Admin/Staff)
│   ├── Tenant.js                 # Tenant model with comprehensive profile
│   ├── Room.js                   # Room model with tenant assignment methods
│   ├── Payment.js                # Payment model with receipt generation
│   ├── Report.js                 # Report model (simplified status tracking)
│   └── Notification.js           # Notification model with auto-expiry
├── routes/
│   ├── authRoutes.js             # Main authentication routes
│   ├── roomRoutes.js             # Room management routes
│   ├── paymentRoutes.js          # Payment management routes
│   ├── reportRoutes.js           # Report management routes
│   └── notificationRoutes.js     # Notification management routes
├── utils/
│   ├── AppError.js               # Custom error class
│   ├── catchAsync.js             # Async error handler
│   ├── roomUtils.js              # Room utility functions
│   ├── receiptGenerator.js       # PDF receipt generation
│   ├── receiptHTMLGenerator.js   # HTML receipt generation
│   ├── notificationService.js    # Notification automation service
│   └── cronJobs.js               # Scheduled notification jobs
├── .env                          # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
└── server.js                    # Main server file
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

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (Admin/Staff)
- `POST /api/auth/login` - Login user (Admin/Staff)
- `POST /api/auth/universal-login` - Universal login (Users & Tenants)
- `POST /api/auth/tenant/register` - Register a new tenant
- `POST /api/auth/tenant/login` - Login tenant
- `POST /api/auth/logout` - Logout user/tenant
- `GET /api/auth/me` - Get current user/tenant profile
- `GET /api/auth/tenant/me` - Get tenant profile with room info
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update user password
- `PUT /api/auth/tenant/updatedetails` - Update tenant details
- `PUT /api/auth/tenant/updatepassword` - Update tenant password
- `DELETE /api/auth/archive` - Archive user account
- `DELETE /api/auth/tenant/archive` - Archive tenant account

### Room Management (`/api/rooms`)
- `GET /api/rooms` - Get all rooms with filtering & pagination
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room details
- `DELETE /api/rooms/:id` - Delete room (Admin only)
- `POST /api/rooms/:id/assign-tenant` - Assign tenant to room
- `DELETE /api/rooms/:id/remove-tenant/:tenantId` - Remove tenant from room
- `GET /api/rooms/stats` - Get room occupancy statistics
- `POST /api/rooms/generate-contract` - Generate a lease agreement PDF
- `GET /api/rooms/contracts/:tenantId` - Download tenant contract

### Payment Management (`/api/payments`)
- `GET /api/payments` - List payments with filters
- `POST /api/payments` - Create payment record
- `GET /api/payments/:id` - Get payment details
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `PUT /api/payments/:id/mark-paid` - Mark payment as paid
- `GET /api/payments/overdue` - List overdue payments
- `GET /api/payments/stats` - Payment statistics overview
- `POST /api/payments/generate-monthly` - Generate monthly rent charges
- `POST /api/payments/backfill-deposits` - Seed missing deposit entries
- `GET /api/payments/tenant/:tenantId` - Tenant payment history
- `GET /api/payments/tenant/:tenantId/summary` - Tenant payment summary by type
- `GET /api/payments/:id/receipt` - Download receipt PDF
- `GET /api/payments/:id/receipt-data` - Receipt JSON payload
- `GET /api/payments/:id/receipt-html` - Receipt HTML template

### Report Management (`/api/reports`)
- `GET /api/reports` - List reports with filtering & pagination
- `POST /api/reports` - Create maintenance/complaint report
- `GET /api/reports/:id` - Get report by ID
- `PUT /api/reports/:id` - Update report status
- `DELETE /api/reports/:id` - Delete report
- `PUT /api/reports/:id/follow-up` - Tenant follow-up on pending report

### Notification Management (`/api/notifications`)
- `GET /api/notifications` - List notifications for current user
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Utilities
- `GET /api/health` - Health check endpoint

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

## Room Model Schema

```javascript
{
  roomNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 10,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad'],
    required: true,
    lowercase: true,
  },
  capacity: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 4 
  },
  monthlyRent: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  securityDeposit: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: 500 
  },
  amenities: [{ 
    type: String, 
    trim: true 
  }],
  floor: { 
    type: Number, 
    min: 0 
  },
  area: { 
    type: Number, 
    min: 1 
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'unavailable'],
    default: 'available',
    lowercase: true,
  },
  tenants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant' 
  }],
  occupancy: {
    current: { type: Number, default: 0, min: 0 },
    max: { type: Number, min: 1 },
  },
  isActive: { type: Boolean, default: true },
  images: [{ type: String, trim: true }],
  notes: { type: String, trim: true, maxlength: 1000 },
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

## Room Validation Rules

### Room Creation/Update
- **Room Number**: Required, max 10 characters, alphanumeric and hyphens only, unique
- **Room Type**: Must be one of: single, double, triple, quad
- **Capacity**: Required, integer between 1 and 4
- **Monthly Rent**: Required, positive number
- **Security Deposit**: Optional, positive number
- **Description**: Optional, max 500 characters
- **Amenities**: Optional array of strings, each max 50 characters
- **Floor**: Optional, non-negative integer
- **Area**: Optional, positive number
- **Status**: Must be one of: available, occupied, maintenance, unavailable
- **Images**: Optional array of valid URLs
- **Notes**: Optional, max 1000 characters
- **Next Maintenance Date**: Optional, valid date

### Tenant Assignment
- **Tenant ID**: Required, valid MongoDB ObjectId
- **Lease Start Date**: Required, valid ISO date
- **Lease End Date**: Optional, valid ISO date, must be after start date
- **Monthly Rent**: Optional, positive number (uses room rent if not provided)
- **Security Deposit**: Optional, positive number (uses room deposit if not provided)

### Room Status Update
- **Status**: Required, must be one of: available, occupied, maintenance, unavailable
- **Notes**: Optional, max 1000 characters

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