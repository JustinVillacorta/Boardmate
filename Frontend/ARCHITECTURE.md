# Frontend Architecture Guide

## 🏗️ Recommended Architecture for MERN Stack

Based on your backend structure, here's the optimal frontend architecture:

### **Feature-Based Component Architecture**

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── index.ts
│   ├── forms/                 # Form components
│   │   ├── LoginForm.tsx
│   │   ├── RoomForm.tsx
│   │   ├── TenantForm.tsx
│   │   └── PaymentForm.tsx
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardLayout.tsx
│   └── common/                # Common components
│       ├── SearchBar.tsx
│       ├── DataTable.tsx
│       └── NotificationBell.tsx
├── pages/
│   ├── auth/                  # Authentication pages
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/             # Dashboard
│   │   ├── DashboardPage.tsx
│   │   └── StatsCards.tsx
│   ├── rooms/                 # Room management
│   │   ├── RoomsListPage.tsx
│   │   ├── RoomDetailPage.tsx
│   │   └── CreateRoomPage.tsx
│   ├── tenants/               # Tenant management
│   │   ├── TenantsListPage.tsx
│   │   ├── TenantDetailPage.tsx
│   │   └── TenantRegistrationPage.tsx
│   ├── payments/              # Payment management
│   │   ├── PaymentsListPage.tsx
│   │   ├── PaymentDetailPage.tsx
│   │   └── CreatePaymentPage.tsx
│   └── reports/               # Reports
│       ├── ReportsPage.tsx
│       └── ReportDetailPage.tsx
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
├── services/                  # API services
│   ├── api.ts                 # Base API configuration
│   ├── authService.ts         # Auth API calls
│   ├── roomService.ts         # Room API calls
│   ├── tenantService.ts       # Tenant API calls
│   ├── paymentService.ts      # Payment API calls
│   └── reportService.ts       # Report API calls
├── context/                   # React Context
│   ├── AuthContext.tsx
│   ├── AppContext.tsx
│   └── NotificationContext.tsx
├── types/                     # TypeScript definitions
│   ├── auth.ts
│   ├── room.ts
│   ├── tenant.ts
│   ├── payment.ts
│   ├── notification.ts
│   └── api.ts
├── utils/                     # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── helpers.ts
├── styles/                    # Styling
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
└── assets/                    # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## 🔄 Backend-Frontend Mapping

### Controllers → Pages/Components
```
Backend Controllers          Frontend Pages/Components
├── authController.js     →  ├── pages/auth/
├── roomController.js     →  ├── pages/rooms/
├── paymentController.js  →  ├── pages/payments/
├── reportController.js   →  ├── pages/reports/
└── notificationController.js → components/common/NotificationBell.tsx
```

### Models → Types
```
Backend Models               Frontend Types
├── User.js               →  ├── types/auth.ts (User interface)
├── Tenant.js             →  ├── types/tenant.ts
├── Room.js               →  ├── types/room.ts
├── Payment.js            →  ├── types/payment.ts
├── Notification.js       →  ├── types/notification.ts
└── Report.js             →  └── types/report.ts
```

### Routes → Services
```
Backend Routes               Frontend Services
├── authRoutes.js         →  ├── services/authService.ts
├── roomRoutes.js         →  ├── services/roomService.ts
├── paymentRoutes.js      →  ├── services/paymentService.ts
├── reportRoutes.js       →  ├── services/reportService.ts
└── tenantRoutes.js       →  └── services/tenantService.ts
```

## 📱 Responsive Design Strategy

### Breakpoints
```css
/* Mobile First Approach */
/* Default: 320px - 767px (Mobile) */
/* sm: 768px - 1023px (Tablet) */
/* lg: 1024px+ (Desktop) */
```

### Layout Components
```typescript
// DashboardLayout.tsx
interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  title?: string;
}

// Responsive sidebar that collapses on mobile
const DashboardLayout: React.FC<LayoutProps> = ({ children, showSidebar = true, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <>
          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <Sidebar />
          </div>
          
          {/* Mobile sidebar */}
          <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
            <MobileSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
      
      {/* Main content */}
      <div className={showSidebar ? "lg:pl-64" : ""}>
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
```

## 🛠️ State Management Strategy

### Option 1: React Context (Recommended for your app size)
```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | Tenant | null;
  isAuthenticated: boolean;
  role: 'admin' | 'staff' | 'tenant' | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Option 2: Redux Toolkit (For more complex state)
```typescript
// store/authSlice.ts
interface AuthState {
  user: User | Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});
```

## 🔌 API Integration Pattern

### Base API Service
```typescript
// services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Feature-Specific Services
```typescript
// services/roomService.ts
import api from './api';
import { Room, CreateRoomData, UpdateRoomData } from '../types/room';

export const roomService = {
  getAll: (): Promise<Room[]> => 
    api.get('/rooms').then(response => response.data.data),
  
  getById: (id: string): Promise<Room> => 
    api.get(`/rooms/${id}`).then(response => response.data.data),
  
  create: (roomData: CreateRoomData): Promise<Room> => 
    api.post('/rooms', roomData).then(response => response.data.data),
  
  update: (id: string, roomData: UpdateRoomData): Promise<Room> => 
    api.put(`/rooms/${id}`, roomData).then(response => response.data.data),
  
  delete: (id: string): Promise<void> => 
    api.delete(`/rooms/${id}`).then(() => undefined),
};
```

## 📋 Component Development Guidelines

### 1. Component Structure
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = ''
}) => {
  // Component implementation
};

export default Button;
```

### 2. Custom Hooks
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}
```

## 🎨 Styling Strategy

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

## 🚀 Development Workflow

1. **Start with the login page** (already implemented)
2. **Create base layout components** (Header, Sidebar)
3. **Build dashboard with stats** (using your backend data)
4. **Implement room management** (CRUD operations)
5. **Add tenant management**
6. **Build payment system**
7. **Create reports section**
8. **Add notifications**
9. **Implement user profile**
10. **Add settings and admin features**

This architecture provides a solid, scalable foundation that aligns perfectly with your MERN stack backend!