# Boardmate Frontend

**React + TypeScript Frontend for Boardmate Boarding House Management System**

A modern, responsive web application built with React, TypeScript, and Tailwind CSS that provides an intuitive interface for managing boarding house operations. The frontend offers role-based dashboards for administrators, staff, and tenants with comprehensive functionality for room management, payment processing, and communication.

## 🎯 Project Overview

This frontend provides a complete user interface that seamlessly integrates with the Boardmate backend API, offering three distinct user experiences based on roles: Administrator, Staff, and Tenant dashboards.

## 🏗️ Architecture

### **Current Implementation: Role-Based Component Architecture**

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components (LoginForm)
│   ├── dashboard/       # Dashboard components (Charts, MetricCards, etc.)
│   ├── layout/          # Layout components (Sidebar, TopNavbar)
│   ├── notifications/   # Notification components
│   ├── payments/        # Payment management components
│   ├── reports/         # Report components
│   ├── rooms/           # Room management components
│   ├── tenant/          # Tenant-specific components
│   ├── users/           # User management components
│   └── ui/              # Basic UI components (Button, Input, etc.)
├── pages/               # Page-level components by role
│   ├── Admin/           # Administrator pages
│   ├── Staff/           # Staff pages
│   ├── Tenant/          # Tenant pages
│   └── shared/          # Shared pages across roles
├── services/            # API services and HTTP clients
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # Global styles and Tailwind CSS
└── config/              # Configuration files
```

### **Role-Based Dashboard System**
- **Admin Dashboard**: Full system control, user management, analytics
- **Staff Dashboard**: Room/tenant management, payment processing
- **Tenant Dashboard**: Personal profile, payments, maintenance requests

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Backend API** running on `http://localhost:3000` (see Backend README)

### Installation & Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - **Development**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3000`

### 🔧 Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run type-check   # Run TypeScript compiler check
```

### 🐛 Troubleshooting

#### Common Setup Issues

1. **Backend Connection Failed**
   - Ensure backend is running on `http://localhost:3000`
   - Check backend health: `curl http://localhost:3000/api/health`
   - Verify CORS settings in backend `.env`

2. **Port Already in Use**
   - Vite will automatically find the next available port
   - Or specify a port: `npm run dev -- --port 3001`

3. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript Errors**
   - Run type check: `npm run type-check`
   - Check `tsconfig.json` configuration
   - Ensure all dependencies are properly typed

## 📱 Responsive Design Features

- **Desktop (1024px+)**: Split-screen layout with gradient sidebar
- **Tablet (768px-1023px)**: Centered form with simplified header
- **Mobile (< 768px)**: Full-width form with compact header

## 🎨 Design System

### Colors
- **Primary**: #4F46E5 (Blue)
- **Gradient**: Linear gradient from #667eea to #764ba2
- **Text**: Various gray shades for hierarchy
- **Background**: Light gray (#F9FAFB)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Consistent spacing** using Tailwind CSS classes
- **Smooth transitions** for interactive elements
- **Focus states** for accessibility
- **Loading states** for better UX

## 🛠️ Technology Stack

### Core Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full type coverage
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Key Dependencies
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling and validation
- **React Query**: Server state management and caching

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **TypeScript**: Static type checking

## 🔗 Backend Integration

The frontend seamlessly integrates with the Boardmate backend API through dedicated service layers:

### Service Architecture
```typescript
// API Service Layer
src/services/
├── authService.ts           # Authentication API calls
├── dashboardService.ts      # Dashboard data fetching
├── notificationService.ts   # Notification management
├── paymentService.ts        # Payment processing
├── roomManagementService.ts # Room CRUD operations
├── tenantDashboardService.ts # Tenant-specific data
└── userManagementService.ts # User management
```

### API Endpoints Integration
```typescript
// Authentication Services
POST /api/auth/login          → authService.login()
POST /api/auth/register       → authService.register()
GET  /api/auth/me            → authService.getCurrentUser()

// Room Management
GET  /api/rooms              → roomManagementService.getRooms()
POST /api/rooms              → roomManagementService.createRoom()
PUT  /api/rooms/:id          → roomManagementService.updateRoom()

// Payment Processing
GET  /api/payments           → paymentService.getPayments()
POST /api/payments           → paymentService.createPayment()
PUT  /api/payments/:id       → paymentService.updatePayment()

// Notifications
GET  /api/notifications      → notificationService.getNotifications()
POST /api/notifications      → notificationService.createNotification()
```

### Type Safety
```typescript
// Type definitions matching backend models
src/types/
├── index.ts                 # Main type exports
├── notification.ts          # Notification types
├── payment.ts              # Payment types
├── report.ts               # Report types
└── room.ts                 # Room types
```

## 🔄 Development Workflow

### Component Development
1. **Create reusable components** in `src/components/`
2. **Build page components** in `src/pages/` by role
3. **Define TypeScript types** in `src/types/` matching backend models
4. **Add API integration** using service layer in `src/services/`
5. **Test responsive design** across different screen sizes

### Code Organization
- **`components/`**: Reusable UI components organized by feature
- **`pages/`**: Full page components organized by user role
- **`services/`**: API calls and HTTP configuration
- **`types/`**: TypeScript interfaces matching backend models
- **`styles/`**: Global CSS and Tailwind configuration
- **`utils/`**: Utility functions and helpers

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Dependencies
npm install          # Install all dependencies
npm update           # Update dependencies
```

## ✨ Features Implemented

### 🔐 Authentication System
- **LoginForm**: Secure login with email/password validation
- **Role-based routing**: Automatic redirection based on user role
- **JWT token management**: Secure authentication state

### 📊 Dashboard Components
- **Charts**: Data visualization for analytics
- **MetricCards**: Key performance indicators
- **DashboardHeader**: Navigation and user info
- **QuickActions**: Common task shortcuts
- **RecentTenancyChanges**: Activity feed

### 🏠 Room Management
- **RoomCard**: Visual room display with tenant info
- **CreateRoomModal**: Add new rooms with full details
- **EditRoomModal**: Update room information
- **ManageTenantsModal**: Assign/remove tenants from rooms

### 👥 User Management
- **UserCard**: User profile display
- **CreateUserModal**: Add new admin/staff accounts
- **EditUserModal**: Update user information

### 💰 Payment System
- **PaymentCard**: Payment history and status display
- **CreatePaymentForm**: Record new payments
- **MarkAsPaidForm**: Update payment status
- **TenantPaymentSummary**: Payment overview for tenants

### 📢 Notification System
- **NotificationCard**: Individual notification display
- **CreateAnnouncementForm**: Send announcements to tenants
- **NotificationsSummaryCard**: Notification overview
- **TenantNotificationCard**: Tenant-specific notifications

### 📋 Reports & Maintenance
- **ReportCard**: Maintenance request display
- **SummaryCard**: Report statistics
- **SubmitMaintenanceForm**: Tenant maintenance request submission

### 🎨 UI Components
- **Button**: Reusable button component
- **Input**: Form input component
- **ConfirmDialog**: Confirmation modals
- **DownloadDialog**: File download interface

### 📱 Responsive Design
- **Mobile-first approach**: Optimized for all screen sizes
- **Tailwind CSS**: Utility-first styling
- **Modern UI**: Clean, professional interface

## 🎯 Why This Architecture?

1. **Scalable**: Easy to add new features and pages
2. **Maintainable**: Clear separation of concerns
3. **Reusable**: Components can be shared across pages
4. **Type-safe**: TypeScript ensures fewer runtime errors
5. **Backend-aligned**: Structure mirrors your API organization
6. **Modern**: Uses current React best practices

This setup provides a solid foundation for building out the complete boarding house management system while maintaining consistency with your backend architecture.