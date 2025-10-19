import React, { useState } from "react";
import { Search, Bell } from "lucide-react";

interface TopNavbarProps {
  title?: string;
  subtitle?: string;
  currentPage?: string;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ 
  title, 
  subtitle,
  currentPage
}) => {
  // Get page-specific title and subtitle based on currentPage
  const getPageInfo = (page?: string) => {
    switch (page) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Your room info, payments, and account status'
        };
      case 'payments':
        return {
          title: 'Payments',
          subtitle: 'Your payment history and upcoming dues'
        };
      case 'reports':
        return {
          title: 'Reports',
          subtitle: 'Submit and track your complaints and maintenance requests'
        };
      case 'notifications':
        return {
          title: 'Notifications',
          subtitle: 'View and manage notifications'
        };
      case 'profile':
        return {
          title: 'Profile',
          subtitle: 'Manage your account and preferences'
        };
      default:
        return {
          title: title || 'Dashboard',
          subtitle: subtitle || 'Your room info, payments, and account status'
        };
    }
  };

  const pageInfo = getPageInfo(currentPage);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Need Better Notifications Design" },
    { id: 2, text: "Make the Website Responsive" },
    { id: 3, text: "Fix Bug of Able to go Back to a Page" },
  ];

  return (
    <header className="bg-blue-50 shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-9 relative">
      <div className="flex items-center justify-between h-auto lg:h-10">
        {/* Left: Logo/Title - Responsive */}
        <div className="cursor-pointer flex flex-col items-start">
          <h1 className="text-xl lg:text-3xl font-semibold text-gray-800">
            {pageInfo.title}
          </h1>
          <p className="text-xs lg:text-sm text-gray-400 hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Right - Responsive */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 pr-4 py-2 w-64 lg:w-80 xl:w-96 border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 relative rounded-lg"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 lg:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Notifications
                  </h3>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((note, idx) => (
                    <li
                      key={note.id}
                      className="px-4 py-4 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {note.text}
                      {idx < notifications.length - 1 && (
                        <hr className="mt-4 border-gray-200" />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;