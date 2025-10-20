import React, { useState } from 'react';
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
import UsersPage from './pages/shared/UsersPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true' ? true : false;
    } catch (e) {
      return false;
    }
  });
  
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'tenant'>(() => {
    try {
      return (localStorage.getItem('userRole') as 'admin' | 'staff' | 'tenant') || 'admin';
    } catch (e) {
      return 'admin';
    }
  });
  
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default to dashboard page

  const handleLogin = (role: 'admin' | 'staff' | 'tenant') => {
    try { 
      localStorage.setItem('isAuthenticated', 'true'); 
      localStorage.setItem('userRole', role);
    } catch (e) {}
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderAdminPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <NotificationsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;

      case 'reports':
        return <ReportsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;

      case 'payment-history':
        return <PaymentHistoryPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      
      case 'dashboard':
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'users':
        return <UsersPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      case 'payment':
        return <PaymentPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
        case 'rooms':
          return <RoomsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="admin" />;
      default:
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} />;
    }
  };

  const renderStaffPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <NotificationsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;

      case 'reports':
        return <ReportsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;

      case 'payment-history':
        return <PaymentHistoryPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      
      case 'dashboard':
        return <StaffDashboard currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'users':
        return <UsersPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      case 'payment':
        return <PaymentPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
        case 'rooms':
          return <RoomsPage currentPage={currentPage} onNavigate={handleNavigation} userRole="staff" />;
      default:
        return <StaffDashboard currentPage={currentPage} onNavigate={handleNavigation} />;
    }
  };

  const renderTenantPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <TenantDashboard currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'payments':
        return <TenantPayments currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'reports':
        return <TenantReports currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'notifications':
        return <TenantNotifications currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'profile':
        return <TenantProfile currentPage={currentPage} onNavigate={handleNavigation} />;
      default:
        return <TenantDashboard currentPage={currentPage} onNavigate={handleNavigation} />;
    }
  };

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