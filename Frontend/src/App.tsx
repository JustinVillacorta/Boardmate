import React, { useState, useEffect } from 'react';
import LoginPage from './pages/Admin/LoginPage.tsx';
import Dashboard from './pages/Admin/Dashboard.tsx';
import StaffDashboard from './pages/Staff/Dashboard.tsx';

// Tenant pages
import TenantDashboard from './pages/Tenant/Dashboard.tsx';
import TenantNotifications from './pages/Tenant/Notifications.tsx';
import TenantPayments from './pages/Tenant/Payments.tsx';
import TenantProfile from './pages/Tenant/Profile.tsx';
import TenantReports from './pages/Tenant/Reports.tsx';

// Reusable page components
import RoomsPage from './pages/shared/RoomsPage';
import PaymentPage from './pages/shared/PaymentPage';
import PaymentHistoryPage from './pages/shared/PaymentHistoryPage';
import ReportsPage from './pages/shared/ReportsPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import AnnouncementsPage from './pages/shared/AnnouncementsPage';
import UsersPage from './pages/shared/UsersPage';
import TenantAnnouncementsPage from './pages/Tenant/TenantAnnouncementsPage';

// Auth service
import { authService } from './services/authService';
import { UserRole } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default to dashboard page

  // Validate token on app startup
  useEffect(() => {
    const validateToken = async () => {
      try {
        const result = await authService.getCurrentUser();
        if (result) {
          setIsAuthenticated(true);
          setUserRole(result.role);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', result.role);
        } else {
          setIsAuthenticated(false);
          setUserRole('admin');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsAuthenticated(false);
        setUserRole('admin');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const handleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUserRole('admin');
      setCurrentPage('dashboard');
    }
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderAdminPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <NotificationsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      
      case 'announcements':
        return <AnnouncementsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;

      case 'reports':
        return <ReportsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;

      case 'payment-history':
        return <PaymentHistoryPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      
      case 'dashboard':
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'users':
        return <UsersPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      case 'payment':
        return <PaymentPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
        case 'rooms':
          return <RoomsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      default:
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  const renderStaffPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <NotificationsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      
      case 'announcements':
        return <AnnouncementsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;

      case 'reports':
        return <ReportsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;

      case 'payment-history':
        return <PaymentHistoryPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      
      case 'dashboard':
        return <StaffDashboard currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'users':
        return <UsersPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      case 'payment':
        return <PaymentPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
        case 'rooms':
          return <RoomsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      default:
        return <StaffDashboard currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  const renderTenantPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <TenantDashboard currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'payments':
        return <TenantPayments currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'reports':
        return <TenantReports currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'notifications':
        return <TenantNotifications currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'announcements':
        return <TenantAnnouncementsPage currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'profile':
        return <TenantProfile currentPage={currentPage} onNavigate={handleNavigation} />;
      default:
        return <TenantDashboard currentPage={currentPage} onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  // Show loading spinner while validating token
  if (isLoading) {
    return (
      <div className="App flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        userRole === 'tenant' ? renderTenantPage() : 
        userRole === 'staff' ? renderStaffPage() : renderAdminPage()
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;