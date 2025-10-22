# Boardmate
**Boarding House Management System**

A comprehensive web application for managing boarding houses, designed to streamline operations for administrators, staff, and tenants.

## 🏠 Overview

Boardmate is a full-stack web application that provides a complete solution for boarding house management. It offers role-based access control with dedicated interfaces for administrators, staff, and tenants, enabling efficient management of rooms, payments, notifications, and maintenance requests.

## ✨ Features

### 🎯 Core Functionality
- **Room Management**: Create, edit, and manage room assignments
- **Tenant Management**: Handle tenant information, assignments, and profiles
- **Payment Processing**: Track rent payments, generate receipts, and manage payment history
- **Notification System**: Send announcements and manage tenant communications
- **Maintenance Reports**: Submit and track maintenance requests
- **User Management**: Admin and staff account management with role-based permissions

### 👥 User Roles

#### **Administrator**
- Full system access and control
- User management (create/edit staff accounts)
- Financial oversight and reporting
- System configuration

#### **Staff**
- Room and tenant management
- Payment processing
- Notification management
- Maintenance request handling

#### **Tenant**
- Personal dashboard and profile management
- Payment history and receipts
- Maintenance request submission
- Notification viewing

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Modern UI components** with responsive design

### Backend
- **Node.js** with Express.js
- **MongoDB** for data storage
- **JWT** authentication
- **RESTful API** architecture

## 📁 Project Structure

```
Boardmate/
├── Frontend/          # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components by user role
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript type definitions
│   └── public/           # Static assets
└── Backend/             # Node.js Express API
    ├── controllers/      # Route handlers
    ├── models/          # Database models
    ├── routes/          # API routes
    ├── middleware/      # Authentication & validation
    └── utils/           # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Boardmate
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Configure environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## 📋 Key Features by Role

### Dashboard Analytics
- Occupancy rates and room status
- Payment tracking and overdue alerts
- Recent activity summaries
- Quick action buttons

### Room Management
- Visual room cards with tenant information
- Occupancy status tracking
- Tenant assignment and reassignment
- Room details and amenities

### Payment System
- Automated payment tracking
- Receipt generation (PDF)
- Payment history and status
- Overdue payment alerts

### Communication
- Announcement creation and distribution
- Tenant notification management
- Maintenance request system
- Real-time updates

## 🔧 Development

The application follows modern development practices with:
- TypeScript for type safety
- Component-based architecture
- RESTful API design
- Responsive design principles
- Role-based access control

## 📄 License

This project is proprietary software developed for boarding house management.
