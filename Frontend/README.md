# Boardmate Frontend

A modern, responsive React + TypeScript frontend for the Boardmate boarding house management system.

## 🎯 Project Overview

This frontend is designed to work with your existing MERN stack backend and provides a clean, professional interface for managing boarding house operations.

## 🏗️ Architecture

### **Recommended Architecture: Component-Based with Feature Modules**

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Modal, etc.)
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── common/          # Common shared components
├── pages/               # Page-level components
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── rooms/           # Room management pages
│   ├── tenants/         # Tenant management pages
│   ├── payments/        # Payment management pages
│   └── reports/         # Reports pages
├── hooks/               # Custom React hooks
├── services/            # API services and HTTP clients
├── context/             # React Context for state management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── styles/              # Global styles and CSS modules
└── assets/              # Static assets (images, icons, etc.)
```

This architecture aligns perfectly with your backend structure:
- **Frontend routes** mirror your **backend API routes**
- **Component structure** matches your **controller/model organization**
- **Type definitions** correspond to your **backend models**

## 🚀 Quick Start

### Option 1: Static HTML Version (Ready to Use)
Open `login.html` in your browser to see the immediate result. This version includes:
- ✅ Responsive design matching your screenshot
- ✅ Purple gradient background with decorative elements
- ✅ Professional login form with icons
- ✅ Password visibility toggle
- ✅ Loading states and animations
- ✅ Mobile-responsive design

### Option 2: React + TypeScript Setup

1. **Install Dependencies**
   ```bash
   cd Frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

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

## 🔗 Backend Integration

The frontend is structured to easily integrate with your existing backend:

### API Endpoints Mapping
```typescript
// Authentication
POST /api/auth/login          → LoginForm component
POST /api/auth/register       → RegisterForm component
GET  /api/auth/me            → useAuth hook

// Rooms Management
GET  /api/rooms              → RoomsList component
POST /api/rooms              → CreateRoom component
PUT  /api/rooms/:id          → EditRoom component

// Tenants Management
GET  /api/tenant             → TenantsList component
POST /api/tenant/register    → TenantRegistration component

// Payments
GET  /api/payments           → PaymentsList component
POST /api/payments           → PaymentForm component

// Reports
GET  /api/reports            → ReportsPage component
```

### State Management
```typescript
// Context structure aligning with your backend models
interface AppState {
  auth: {
    user: User | Tenant | null;
    isAuthenticated: boolean;
    role: 'admin' | 'staff' | 'tenant';
  };
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  notifications: Notification[];
}
```

## 🛠️ Next Steps for Full Implementation

1. **Set up proper TypeScript environment**
   ```bash
   npm install @types/react @types/react-dom
   ```

2. **Add state management**
   - React Context for simple state
   - Redux Toolkit for complex state
   - React Query for server state

3. **Add routing**
   ```bash
   npm install react-router-dom @types/react-router-dom
   ```

4. **Add form validation**
   ```bash
   npm install react-hook-form @hookform/resolvers yup
   ```

5. **Add HTTP client**
   ```bash
   npm install axios
   ```

6. **Add UI component library** (optional)
   ```bash
   npm install @headlessui/react @heroicons/react
   ```

## 📂 File Structure Explanation

- **`components/ui/`**: Reusable components like Button, Input, Modal
- **`pages/`**: Full page components corresponding to routes
- **`types/`**: TypeScript interfaces matching your backend models
- **`styles/`**: Global CSS and component-specific styles
- **`services/`**: API calls and HTTP configuration

## 🔄 Development Workflow

1. **Create components** that match your backend functionality
2. **Define TypeScript types** based on your backend models
3. **Build pages** by composing smaller components
4. **Add API integration** using your existing backend endpoints
5. **Test responsive design** across different screen sizes

## 📋 Features Implemented

### Login Page ✅
- Responsive split-screen design
- Purple gradient background matching your design
- Email and password fields with icons
- Password visibility toggle
- Loading states
- Mobile-responsive layout

### Ready for Implementation
- Dashboard with stats cards
- Room management (CRUD operations)
- Tenant management
- Payment tracking
- Notification system
- Reports generation
- User profile management

## 🎯 Why This Architecture?

1. **Scalable**: Easy to add new features and pages
2. **Maintainable**: Clear separation of concerns
3. **Reusable**: Components can be shared across pages
4. **Type-safe**: TypeScript ensures fewer runtime errors
5. **Backend-aligned**: Structure mirrors your API organization
6. **Modern**: Uses current React best practices

This setup provides a solid foundation for building out the complete boarding house management system while maintaining consistency with your backend architecture.