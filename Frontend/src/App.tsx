import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      )}
      
      {/* Demo toggle button - remove in production */}
      <button
        onClick={() => setIsAuthenticated(!isAuthenticated)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm z-50"
      >
        {isAuthenticated ? 'Go to Login' : 'Go to Dashboard'}
      </button>
    </div>
  );
};

export default App;