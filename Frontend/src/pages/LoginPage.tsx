import React from 'react';
import LoginForm from '../components/auth/LoginForm';

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 relative overflow-hidden">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full text-white space-y-6 p-12">
          {/* Icon Circle */}
          <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg">
            <svg
              width="180"
              height="135"
              viewBox="0 0 98 78"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M70.9664 0.00170898H26.725L0.582364 27.4534L9.83284 26.9151V56.6993L2.79443 57.417C2.79443 57.417 -0.62422 57.9552 0.18017 61.1849C0.984559 63.5173 3.59882 63.5174 3.59882 63.5174L9.83284 62.6202V70.5148L53.8731 77.6917L88.4619 70.6943V27.6328L97.9135 26.9151C97.7124 26.7357 70.9664 0.00170898 70.9664 0.00170898ZM61.917 32.6566L71.5697 31.7595V43.0632L61.917 44.1397V32.6566ZM13.0504 68.5412V62.2614L32.1546 59.3906C32.1546 59.3906 35.3722 59.3906 35.1711 56.161C34.97 53.2903 31.3503 53.8285 31.3503 53.8285L13.0504 56.3404V26.018L32.3557 5.74324L53.8731 26.9151V75.0004L13.0504 68.5412ZM61.917 59.57V47.9076L71.5697 46.831V58.1347L61.917 59.57ZM83.4345 56.161L75.3906 57.417V46.2928L83.4345 45.2162V56.161ZM75.5917 42.7043V31.5801L83.6356 30.8624V41.8072C83.4345 41.8072 75.5917 42.7043 75.5917 42.7043ZM41.4051 27.8122C39.193 25.4797 36.1766 24.0444 32.7579 24.0444H32.1546C28.736 24.2238 25.9206 25.8386 23.9097 28.1711C21.8987 30.5036 20.6921 33.7332 20.6921 37.1422V38.0393C20.8932 41.6278 22.3009 44.8574 24.5129 47.0105C26.725 49.343 29.7415 50.7783 33.1601 50.7783H33.7634C37.1821 50.5989 39.9974 48.9841 42.0084 46.6516C44.0194 44.3191 45.226 41.0895 45.226 37.6805V36.7834C45.0249 33.3743 43.6172 30.1447 41.4051 27.8122ZM39.9974 45.3957C38.3887 47.3693 35.9755 48.6253 33.5623 48.6253H33.1601C30.5459 48.6253 28.1327 47.5487 26.3228 45.5751C24.5129 43.6014 23.1053 40.9101 23.1053 37.8599V37.1422C23.1053 34.092 24.1107 31.4007 25.9206 29.427C27.5294 27.4534 29.9426 26.1974 32.3557 26.1974H32.7579C35.3722 26.1974 37.7854 27.274 39.5952 29.2476C41.4051 31.2213 42.8128 33.9126 42.8128 36.9628V37.6805C42.8128 40.7307 41.8073 43.422 39.9974 45.3957ZM28.736 37.6805C28.5349 33.9126 29.9426 30.5036 31.9535 29.2476C28.3338 29.427 25.5184 33.3743 25.9206 37.8599C26.1217 42.5249 29.3393 46.1133 32.959 45.9339C30.747 44.8574 28.9371 41.6278 28.736 37.6805Z"
                fill="#ffffffff"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-extrabold text-center">Welcome Back!</h2>

          {/* Description */}
          <p className="text-lg text-center max-w-xs opacity-90">
            Access your account and continue your journey with us.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="w-8 h-8 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                <circle cx="7" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="m8.5 8.5 1.5 1.5" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-gray-600">Sign in to access your boarding house dashboard</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="hidden lg:block text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
              <p className="text-gray-600">Sign in to access your boarding house dashboard</p>
            </div>

            <LoginForm onLogin={onLogin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;