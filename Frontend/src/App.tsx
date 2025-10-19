import React, { useState } from 'react';
import LoginPage from './pages/Admin/LoginPage';
import Dashboard from './pages/Admin/Dashboard';
import UsersPage from './pages/Admin/UsersPage';
import Rooms from './pages/Admin/Rooms';
import Payment from './pages/Admin/Payment';
import PaymentHistory from './pages/Admin/PaymentHistory';
import Reports from './pages/Admin/Reports';
import Notifications from './pages/Admin/Notifications';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('isAuthenticated') === 'true' ? true : false;
    } catch (e) {
      return false;
    }
  });
  const [currentPage, setCurrentPage] = useState('dashboard'); // Default to dashboard page

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'notifications':
        return <Notifications currentPage={currentPage} onNavigate={handleNavigation} />;

      case 'reports':
        return <Reports currentPage={currentPage} onNavigate={handleNavigation} />;

      case 'payment-history':
        return <PaymentHistory currentPage={currentPage} onNavigate={handleNavigation} />;
      
      case 'dashboard':
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'users':
        return <UsersPage currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'payment':
        return <Payment currentPage={currentPage} onNavigate={handleNavigation} />;
        case 'rooms':
          return <Rooms currentPage={currentPage} onNavigate={handleNavigation} />;
      default:
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        renderCurrentPage()
      ) : (
        <LoginPage onLogin={() => {
          try { localStorage.setItem('isAuthenticated', 'true'); } catch (e) {}
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        }} />
      )}
    </div>
  );
};

export default App;