import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for development
  const [currentPage, setCurrentPage] = useState('users'); // Default to users page

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentPage={currentPage} onNavigate={handleNavigation} />;
      case 'users':
        return <UsersPage currentPage={currentPage} onNavigate={handleNavigation} />;
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