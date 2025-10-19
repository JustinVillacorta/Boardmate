import React, { useState } from 'react';
import LoginPage from './pages/Admin/LoginPage';
import Dashboard from './pages/Admin/Dashboard';
import StaffDashboard from './pages/Staff/Dashboard';

// Reusable page components
import RoomsPage from './components/pages/RoomsPage';
import PaymentPage from './components/pages/PaymentPage';
import PaymentHistoryPage from './components/pages/PaymentHistoryPage';
import ReportsPage from './components/pages/ReportsPage';
import NotificationsPage from './components/pages/NotificationsPage';
import UsersPage from './components/pages/UsersPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true' ? true : false;
    } catch (e) {
      return false;
    }
  });
  
  const [userRole, setUserRole] = useState<'admin' | 'staff'>(() => {
    try {
      return (localStorage.getItem('userRole') as 'admin' | 'staff') || 'admin';
    } catch (e) {
      return 'admin';
    }
  });
  
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default to dashboard page

  const handleLogin = (role: 'admin' | 'staff') => {
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

  return (
    <div className="App">
      {isAuthenticated ? (
        userRole === 'staff' ? renderStaffPage() : renderAdminPage()
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;