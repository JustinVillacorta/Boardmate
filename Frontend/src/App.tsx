import React, { useState } from 'react';
import LoginPage from './pages/Admin/LoginPage';
import Dashboard from './pages/Admin/Dashboard';
import UsersPage from './pages/Admin/UsersPage';
import Rooms from './pages/Admin/Rooms';
import Payment from './pages/Admin/Payment';
import PaymentHistory from './pages/Admin/PaymentHistory';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for development
  const [currentPage, setCurrentPage] = useState('users'); // Default to users page

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
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
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
};

export default App;