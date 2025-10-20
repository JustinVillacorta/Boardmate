# Boardmate API Test Examples

This file contains comprehensive examples for testing all API endpoints using various tools like Postman, curl, or JavaScript fetch.

## Base URL
```
Local Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

## Authentication Headers
Most endpoints require authentication. Include this header with your requests:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Register User (Admin/Staff)
```bash
# curl
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "john.admin@boardmate.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

```javascript
// JavaScript fetch
const registerUser = async () => {
  const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'John Admin',
      email: 'john.admin@boardmate.com',
      password: 'Admin123!',
      role: 'admin'
    })
  });
  const data = await response.json();
  console.log(data);
};
```

### 1.2 Login User (Admin/Staff)
```bash
# curl
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.admin@boardmate.com",
    "password": "Admin123!"
  }'
```

### 1.3 Register Tenant
```bash
# curl
curl -X POST http://localhost:8000/api/auth/tenant/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "password": "Tenant123!",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1995-05-15",
    "occupation": "Software Developer",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "province": "Any Province",
      "zipCode": "12345"
    },
    "idType": "drivers_license",
    "idNumber": "DL123456789",
    "emergencyContact": {
      "name": "John Doe",
      "relationship": "Brother",
      "phoneNumber": "+0987654321"
    }
  }'
```

### 1.4 Universal Login (Users & Tenants)
```bash
# curl
curl -X POST http://localhost:8000/api/auth/universal-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@example.com",
    "password": "Tenant123!"
  }'
```

### 1.5 Get Current User Profile
```bash
# curl (replace TOKEN with actual JWT token)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 1.6 Update User Details
```bash
# curl
curl -X PUT http://localhost:8000/api/auth/updatedetails \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "John Smith Admin",
    "email": "john.smith@boardmate.com"
  }'
```

### 1.7 Update Password
```bash
# curl
curl -X PUT http://localhost:8000/api/auth/updatepassword \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "Admin123!",
    "newPassword": "NewAdmin123!",
    "confirmPassword": "NewAdmin123!"
  }'
```

### 1.8 Update Tenant Details (Tenant Self-Update)
```bash
# curl - Tenant updating their own profile
curl -X PUT http://localhost:8000/api/auth/tenant/updatedetails \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN_HERE" \
  -d '{
    "firstName": "Jane Updated",
    "lastName": "Doe Updated",
    "phoneNumber": "+1234567891",
    "occupation": "Senior Software Developer",
    "address": {
      "street": "456 Updated Street",
      "city": "Updated City",
      "province": "Updated Province",
      "zipCode": "54321"
    },
    "emergencyContact": {
      "name": "Updated Emergency Contact",
      "relationship": "Sister",
      "phoneNumber": "+1987654321"
    }
  }'
```

### 1.9 Update Tenant Password (Tenant Self-Update)
```bash
# curl - Tenant updating their own password
curl -X PUT http://localhost:8000/api/auth/tenant/updatepassword \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN_HERE" \
  -d '{
    "currentPassword": "Tenant123!",
    "newPassword": "NewTenant123!",
    "confirmPassword": "NewTenant123!"
  }'
```

### 1.10 Get Staff and Tenants List (Admin/Staff only)
```bash
# curl - Get all staff and tenants
curl -X GET http://localhost:8000/api/auth/staff-and-tenants \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Get only staff users
curl -X GET "http://localhost:8000/api/auth/staff-and-tenants?userType=staff" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Get only tenants
curl -X GET "http://localhost:8000/api/auth/staff-and-tenants?userType=tenant" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Get with pagination
curl -X GET "http://localhost:8000/api/auth/staff-and-tenants?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 1.11 Update User by Admin (Admin only)
```bash
# curl - Admin updating another user's details
curl -X PUT http://localhost:8000/api/auth/admin/update-user/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "name": "Updated Staff Name",
    "email": "updated.staff@boardmate.com"
  }'
```

### 1.12 Update Tenant by Staff/Admin (Staff/Admin only)
```bash
# curl - Staff/Admin updating tenant details
curl -X PUT http://localhost:8000/api/auth/staff/update-tenant/TENANT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STAFF_TOKEN_HERE" \
  -d '{
    "firstName": "Updated First Name",
    "lastName": "Updated Last Name",
    "phoneNumber": "+1234567891",
    "occupation": "Updated Occupation",
    "address": {
      "street": "456 Updated Street",
      "city": "Updated City",
      "province": "Updated Province",
      "zipCode": "54321"
    },
    "emergencyContact": {
      "name": "Updated Emergency Contact",
      "relationship": "Sister",
      "phoneNumber": "+1987654321"
    }
  }'
```

### 1.13 Archive User by Admin (Admin only)
```bash
# curl - Admin archiving a staff user
curl -X DELETE http://localhost:8000/api/auth/admin/archive-user/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 1.14 Unarchive User by Admin (Admin only)
```bash
# curl - Admin unarchiving a staff user
curl -X PATCH http://localhost:8000/api/auth/admin/unarchive-user/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 1.15 Archive Tenant by Admin (Admin only)
```bash
# curl - Admin archiving a tenant
curl -X DELETE http://localhost:8000/api/auth/admin/archive-tenant/TENANT_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 1.16 Unarchive Tenant by Admin (Admin only)
```bash
# curl - Admin unarchiving a tenant
curl -X PATCH http://localhost:8000/api/auth/admin/unarchive-tenant/TENANT_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 1.17 Archive Own Account (Self-Archive)
```bash
# curl - User archiving their own account
curl -X DELETE http://localhost:8000/api/auth/archive \
  -H "Authorization: Bearer YOUR_USER_TOKEN_HERE"

# curl - Tenant archiving their own account
curl -X DELETE http://localhost:8000/api/auth/tenant/archive \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN_HERE"
```

### 1.18 Logout User
```bash
# curl - Logout (no token required)
curl -X POST http://localhost:8000/api/auth/logout
```

---

## 2. ROOM MANAGEMENT ENDPOINTS

### 2.1 Create Room (Admin/Staff only)
```bash
# curl
curl -X POST http://localhost:8000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "roomNumber": "101A",
    "roomType": "double",
    "capacity": 2,
    "monthlyRent": 550,
    "securityDeposit": 275,
    "description": "Spacious double room with city view",
    "amenities": ["WiFi", "Air Conditioning", "Private Bathroom", "Desk"],
    "floor": 1,
    "area": 25.5
  }'
```

### 2.2 Get All Rooms with Filtering
```bash
# curl - Get all rooms
curl -X GET http://localhost:8000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# curl - Get rooms with filters
curl -X GET "http://localhost:8000/api/rooms?roomType=double&status=available&maxRent=600&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2.3 Get Available Rooms
```bash
# curl
curl -X GET "http://localhost:8000/api/rooms/available?roomType=single&maxRent=500" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2.4 Get Single Room
```bash
# curl (replace ROOM_ID with actual room ID)
curl -X GET http://localhost:8000/api/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2.5 Update Room
```bash
# curl
curl -X PUT http://localhost:8000/api/rooms/ROOM_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "monthlyRent": 600,
    "description": "Updated spacious double room with city view and new furniture",
    "amenities": ["WiFi", "Air Conditioning", "Private Bathroom", "Desk", "Mini Fridge"]
  }'
```

### 2.6 Assign Tenant to Room
```bash
# curl
curl -X POST http://localhost:8000/api/rooms/ROOM_ID_HERE/assign-tenant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "tenantId": "TENANT_ID_HERE",
    "leaseStartDate": "2024-01-01",
    "leaseEndDate": "2024-12-31",
    "monthlyRent": 550,
    "securityDeposit": 275
  }'
```

### 2.7 Remove Tenant from Room
```bash
# curl
curl -X DELETE http://localhost:8000/api/rooms/ROOM_ID_HERE/remove-tenant/TENANT_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 2.8 Get Room Statistics
```bash
# curl
curl -X GET http://localhost:8000/api/rooms/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## 3. PAYMENT MANAGEMENT ENDPOINTS

### 3.1 Create Payment Record
```bash
# curl
curl -X POST http://localhost:8000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "tenant": "TENANT_ID_HERE",
    "room": "ROOM_ID_HERE",
    "amount": 550,
    "paymentType": "rent",
    "paymentMethod": "bank_transfer",
    "dueDate": "2024-01-31",
    "status": "paid",
    "paymentDate": "2024-01-30",
    "periodCovered": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "transactionReference": "TXN123456789",
    "description": "Monthly rent payment for January 2024"
  }'
```

### 3.2 Get All Payments with Filtering
```bash
# curl - Get all payments
curl -X GET http://localhost:8000/api/payments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Get payments with filters
curl -X GET "http://localhost:8000/api/payments?tenant=TENANT_ID&status=pending&paymentType=rent&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

### 3.3 Get Payment by ID
```bash
# curl
curl -X GET http://localhost:8000/api/payments/PAYMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3.4 Update Payment and Mark as Paid
```bash
# curl - Update payment details and mark as paid
curl -X PUT http://localhost:8000/api/payments/PAYMENT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "status": "paid",
    "paymentDate": "2024-01-30",
    "paymentMethod": "cash",
    "transactionReference": "CASH001",
    "notes": "Payment received in cash"
  }'
```

### 3.5 Quick Mark Payment as Paid (Alternative Method)
```bash
# curl - Quick mark as paid with minimal data
curl -X PUT http://localhost:8000/api/payments/PAYMENT_ID_HERE/mark-paid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "paymentMethod": "cash",
    "transactionReference": "CASH001",
    "paymentDate": "2024-01-30"
  }'
```

### 3.6 Download Payment Receipt (PDF)
```bash
# curl - Download PDF receipt
curl -X GET http://localhost:8000/api/payments/PAYMENT_ID_HERE/receipt/pdf \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output receipt.pdf
```

### 3.7 Get Payment Receipt (HTML)
```bash
# curl - Get HTML receipt
curl -X GET http://localhost:8000/api/payments/PAYMENT_ID_HERE/receipt/html \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3.8 Get Payment Statistics
```bash
# curl
curl -X GET http://localhost:8000/api/payments/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## 4. REPORT MANAGEMENT ENDPOINTS

### 4.1 Create Report
```bash
# curl - Tenant creating a report
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN_HERE" \
  -d '{
    "room": "ROOM_ID_HERE",
    "type": "maintenance",
    "title": "Broken Air Conditioning",
    "description": "The air conditioning unit in my room has stopped working. It makes a loud noise when turned on but does not cool the room."
  }'

# curl - Admin/Staff creating a report for a tenant
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "tenant": "TENANT_ID_HERE",
    "room": "ROOM_ID_HERE",
    "type": "complaint",
    "title": "Noise Complaint",
    "description": "Tenant reports excessive noise from neighboring room during late hours."
  }'
```

### 4.2 Get All Reports with Filtering
```bash
# curl - Admin/Staff get all reports
curl -X GET http://localhost:8000/api/reports \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Get reports with filters
curl -X GET "http://localhost:8000/api/reports?status=pending&type=maintenance&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Tenant get their own reports
curl -X GET http://localhost:8000/api/reports \
  -H "Authorization: Bearer YOUR_TENANT_TOKEN_HERE"
```

### 4.3 Get Single Report
```bash
# curl
curl -X GET http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4.4 Update Report Status (Admin/Staff only)
```bash
# curl - Mark as in-progress
curl -X PUT http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "status": "in-progress"
  }'

# curl - Mark as resolved
curl -X PUT http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "status": "resolved"
  }'
```

### 4.5 Delete Report (Admin only)
```bash
# curl
curl -X DELETE http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## 5. NOTIFICATION ENDPOINTS

### 5.1 Get User Notifications
```bash
# curl - Get all notifications
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# curl - Get unread notifications only
curl -X GET "http://localhost:8000/api/notifications?includeRead=false" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# curl - Get specific type of notifications
curl -X GET "http://localhost:8000/api/notifications?type=payment_due&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.2 Get Unread Notification Count
```bash
# curl
curl -X GET http://localhost:8000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.3 Get Single Notification
```bash
# curl
curl -X GET http://localhost:8000/api/notifications/NOTIFICATION_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.4 Mark Notification as Read
```bash
# curl
curl -X PUT http://localhost:8000/api/notifications/NOTIFICATION_ID_HERE/read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.5 Mark All Notifications as Read
```bash
# curl
curl -X PUT http://localhost:8000/api/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.6 Delete Notification
```bash
# curl
curl -X DELETE http://localhost:8000/api/notifications/NOTIFICATION_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5.7 Create System Announcement (Admin only)
```bash
# curl
curl -X POST http://localhost:8000/api/notifications/announcement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
  -d '{
    "title": "Maintenance Notice",
    "message": "Scheduled maintenance will be performed on all air conditioning units this weekend. Please expect brief interruptions.",
    "expiresAt": "2024-02-15T23:59:59.000Z"
  }'
```

### 5.8 Trigger Manual Notifications (Admin only - Testing)
```bash
# curl - Trigger payment reminders
curl -X POST http://localhost:8000/api/notifications/trigger/payment-reminders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"

# curl - Trigger lease reminders
curl -X POST http://localhost:8000/api/notifications/trigger/lease-reminders \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

---

## 6. HEALTH CHECK ENDPOINT

### 6.1 API Health Check
```bash
# curl
curl -X GET http://localhost:8000/api/health
```

---

## POSTMAN COLLECTION EXAMPLE

Here's a sample Postman collection structure:

```json
{
  "info": {
    "name": "Boardmate API",
    "description": "Complete API collection for Boardmate boarding house management system"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "adminToken",
      "value": ""
    },
    {
      "key": "tenantToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register Admin",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Admin User\",\n  \"email\": \"admin@boardmate.com\",\n  \"password\": \"Admin123!\",\n  \"role\": \"admin\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## TESTING WORKFLOW

### Step 1: Authentication
1. Register admin user
2. Login admin user to get token
3. Register staff user
4. Register tenant
5. Login tenant to get token

### Step 2: User Management (New Admin Endpoints)
1. Get staff and tenants list
2. Update user details (admin updating staff)
3. Update tenant details (staff/admin updating tenant)
4. Archive/unarchive users and tenants
5. Test permission restrictions (staff cannot edit other staff)

### Step 3: Room Management
1. Create rooms
2. Get available rooms
3. Assign tenants to rooms

### Step 4: Payment Management
1. Create payment records
2. Mark payments as paid
3. Download receipts

### Step 5: Report Management
1. Create reports (as tenant)
2. Update report status (as admin)
3. View reports

### Step 6: Notifications
1. Check notifications created automatically
2. Create manual announcements
3. Mark notifications as read

## COMPREHENSIVE ADMIN ENDPOINT TESTING

### Test Scenario 1: Admin User Management
```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@boardmate.com", "password": "Admin123!"}' | \
  jq -r '.data.token')

# 2. Get staff and tenants list
curl -X GET http://localhost:8000/api/auth/staff-and-tenants \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Update a staff user's details
curl -X PUT http://localhost:8000/api/auth/admin/update-user/STAFF_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name": "Updated Staff Name", "email": "updated@boardmate.com"}'

# 4. Archive a staff user
curl -X DELETE http://localhost:8000/api/auth/admin/archive-user/STAFF_ID_HERE \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Unarchive the staff user
curl -X PATCH http://localhost:8000/api/auth/admin/unarchive-user/STAFF_ID_HERE \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test Scenario 2: Staff Tenant Management
```bash
# 1. Login as staff
STAFF_TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "staff@boardmate.com", "password": "Staff123!"}' | \
  jq -r '.data.token')

# 2. Update tenant details (should work)
curl -X PUT http://localhost:8000/api/auth/staff/update-tenant/TENANT_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"firstName": "Updated", "lastName": "Tenant", "phoneNumber": "+1234567890"}'

# 3. Try to update another staff (should fail with 403)
curl -X PUT http://localhost:8000/api/auth/admin/update-user/OTHER_STAFF_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"name": "Should Fail"}'

# 4. Archive tenant (should work)
curl -X DELETE http://localhost:8000/api/auth/admin/archive-tenant/TENANT_ID_HERE \
  -H "Authorization: Bearer $STAFF_TOKEN"

# 5. Try to archive another staff (should fail with 403)
curl -X DELETE http://localhost:8000/api/auth/admin/archive-user/OTHER_STAFF_ID_HERE \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

### Test Scenario 3: Permission Validation
```bash
# Test that staff cannot access admin-only endpoints
curl -X PUT http://localhost:8000/api/auth/admin/update-user/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -d '{"name": "Should Fail"}'
# Expected: 403 Forbidden

# Test that tenants cannot access staff/admin endpoints
curl -X GET http://localhost:8000/api/auth/staff-and-tenants \
  -H "Authorization: Bearer $TENANT_TOKEN"
# Expected: 403 Forbidden

# Test that archived users cannot login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "archived@boardmate.com", "password": "Password123!"}'
# Expected: 401 Unauthorized
```

### Test Scenario 4: Self-Archive Prevention
```bash
# Test that admin cannot archive themselves through admin endpoint
curl -X DELETE http://localhost:8000/api/auth/admin/archive-user/ADMIN_OWN_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: 400 Bad Request with message about using self-archive endpoint
```

---

## COMMON RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": { /* user/tenant/room/payment/report/notification object */ },
    "token": "jwt_token_here"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  },
  "data": {
    "items": [ /* array of objects */ ]
  }
}
```

---

## ENVIRONMENT VARIABLES FOR TESTING

Create a `.env.test` file:
```env
NODE_ENV=test
PORT=8001
MONGODB_URI=mongodb://localhost:27017/boardmate_test
JWT_SECRET=test_jwt_secret_key_for_testing_only
JWT_EXPIRE=1d
BCRYPT_SALT_ROUNDS=10
CLIENT_URL=http://localhost:3000
```

---

## AUTOMATED TESTING SCRIPTS

### JavaScript Test Script Example
```javascript
// test-api.js
const baseUrl = 'http://localhost:8000/api';
let adminToken = '';
let tenantToken = '';

// Test authentication
async function testAuth() {
  // Register admin
  const adminResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Admin',
      email: 'test.admin@boardmate.com',
      password: 'Admin123!',
      role: 'admin'
    })
  });
  
  const adminData = await adminResponse.json();
  adminToken = adminData.data.token;
  console.log('Admin registered and logged in:', adminData.success);
  
  // Register tenant
  const tenantResponse = await fetch(`${baseUrl}/auth/tenant/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Tenant',
      email: 'test.tenant@example.com',
      password: 'Tenant123!',
      phoneNumber: '+1234567890',
      dateOfBirth: '1995-01-01',
      idType: 'drivers_license',
      idNumber: 'TEST123456',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Friend',
        phoneNumber: '+0987654321'
      }
    })
  });
  
  const tenantData = await tenantResponse.json();
  tenantToken = tenantData.data.token;
  console.log('Tenant registered and logged in:', tenantData.success);
}

// Run tests
testAuth().then(() => {
  console.log('Authentication tests completed');
}).catch(console.error);
```

This comprehensive test guide covers all endpoints and provides multiple testing approaches including curl commands, JavaScript examples, and Postman collection structure.