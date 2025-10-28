// Sidebar.tsx
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  User, 
  DoorOpen, 
  PhilippinePeso, 
  Wrench, 
  BellDot,
  Megaphone,
  Menu,
  X
} from "lucide-react";
import { authService } from '../../services/authService';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  userRole?: 'admin' | 'staff' | 'tenant';
  onLogout?: () => void;
}

interface NavigationItem {
  name: string;
  icon: React.ElementType;
  page?: string;
  active: boolean;
  action?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage = 'dashboard', onNavigate, userRole, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Compute current user role and data robustly from props or localStorage
  const currentUserRole: 'admin' | 'staff' | 'tenant' = (() => {
    if (userRole) return userRole;
    try {
      const r = localStorage.getItem('userRole');
      if (r === 'admin' || r === 'staff' || r === 'tenant') return r;
    } catch (e) {}
    return 'admin';
  })();

  // Normalize different userData shapes stored in localStorage into a single `currentUser` object
  const currentUser = (() => {
    // Default fallback
    const fallback = {
      displayName: currentUserRole === 'tenant' ? 'Tenant' : currentUserRole === 'staff' ? 'Staff' : 'Admin',
      roleLabel: currentUserRole === 'tenant' ? 'Tenant' : currentUserRole === 'staff' ? 'Staff' : 'Admin',
      initials: (() => {
        const base = currentUserRole === 'tenant' ? 'T' : currentUserRole === 'staff' ? 'S' : 'A';
        return base;
      })(),
    };

    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);

      // helper: try many keys and formats
      const capitalize = (s: string) => s.replace(/(^|[\s._-])+([a-z])/g, (_, p1, p2) => (p1 ? ' ' : '') + p2.toUpperCase()).trim();
      const prettifyUsername = (u: string) => {
        if (!u) return '';
        // if username contains separators, split and capitalize
        if (/[._\- ]/.test(u)) return u.split(/[._\- ]+/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        // if contains digits or @, strip domain
        if (u.includes('@')) u = u.split('@')[0];
        // fallback: capitalize first char
        return u.charAt(0).toUpperCase() + u.slice(1);
      };

      const readNameFrom = (o: any) => {
        if (!o) return null;
        const first = o.firstName || o.first_name || o.firstname || o.givenName || o.given_name || '';
        const last = o.lastName || o.last_name || o.lastname || o.familyName || o.family_name || '';
        const full = o.name || o.fullName || o.full_name || o.displayName || o.display_name || o.name_display || '';
        const username = o.username || o.userName || o.login || o.email?.split('@')[0] || o.handle || '';
        const email = o.email || '';
        const preferFull = (full || '').trim();
        const preferFirstLast = (first || last) ? `${first} ${last}`.trim() : '';
        const preferUsername = username ? prettifyUsername(username) : '';
        const preferEmailLocal = email ? email.split('@')[0] : '';
        const displayName = preferFull || preferFirstLast || preferUsername || preferEmailLocal || null;
        if (!displayName) return null;
        // initials: take first letters of up to two words
        const words = displayName.split(/\s+/).filter(Boolean);
        const initials = (words.length === 1)
          ? words[0].charAt(0).toUpperCase()
          : (words[0].charAt(0) + (words[1].charAt(0) || '')).toUpperCase();
        return { displayName: capitalize(displayName), initials };
      };

      // Try tenant
      const tenantCandidate = readNameFrom(parsed?.tenant);
      if (tenantCandidate) return { displayName: tenantCandidate.displayName, roleLabel: 'Tenant', initials: tenantCandidate.initials };

      // Try user (admin/staff). If there's a single 'name' field prefer it (common backend shape)
      if (parsed?.user?.name && !(parsed?.user?.firstName || parsed?.user?.lastName)) {
        const rawName = parsed.user.name as string;
        const pretty = (rawName || '').replace(/[._\-]+/g, ' ').trim();
        const displayName = pretty ? (pretty.charAt(0).toUpperCase() + pretty.slice(1)) : null;
        if (displayName) {
          const words = displayName.split(/\s+/).filter(Boolean);
          const initials = words.length === 1 ? words[0].charAt(0).toUpperCase() : (words[0].charAt(0) + (words[1].charAt(0) || '')).toUpperCase();
          const rawRole = (parsed?.user?.role || parsed?.role || currentUserRole) as string;
          const roleLabel = rawRole ? (rawRole.charAt(0).toUpperCase() + rawRole.slice(1)) : fallback.roleLabel;
          return { displayName, roleLabel, initials };
        }
      }

      const userCandidate = readNameFrom(parsed?.user);
      if (userCandidate) {
        const rawRole = (parsed?.user?.role || parsed?.role || currentUserRole) as string;
        const roleLabel = rawRole ? (rawRole.charAt(0).toUpperCase() + rawRole.slice(1)) : fallback.roleLabel;
        return { displayName: userCandidate.displayName, roleLabel, initials: userCandidate.initials };
      }

      // Try top-level object
      const topCandidate = readNameFrom(parsed);
      if (topCandidate) return { displayName: topCandidate.displayName, roleLabel: fallback.roleLabel, initials: topCandidate.initials };

      return fallback;
    } catch (e) {
      return fallback;
    }
  })();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutConfirm(false);
    
    try {
      // Use the authService logout function
      await authService.logout();
      
      // Add a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Call the parent logout handler if provided
      if (onLogout) {
        onLogout();
      } else {
        // Fallback: reload the app
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Reset the loading state on error
      setIsLoggingOut(false);
      
      // Show error to user (you might want to add error state)
      alert('Logout failed. Please try again.');
    }
  };
  // Role-specific navigation items
  const getNavigationItems = (): NavigationItem[] => {
    if (currentUserRole === 'tenant') {
      return [
        { name: "Dashboard", icon: LayoutDashboard, page: "dashboard", active: currentPage === 'dashboard' },
        { name: "Payments", icon: PhilippinePeso, page: "payments", active: currentPage === 'payments' },
        { name: "Reports", icon: Wrench, page: "reports", active: currentPage === 'reports' },
        { name: "Notifications", icon: BellDot, page: "notifications", active: currentPage === 'notifications' },
        { name: "Announcements", icon: Megaphone, page: "announcements", active: currentPage === 'announcements' },
        { name: "Profile", icon: User, page: "profile", active: currentPage === 'profile' },
        { name: "Logout", icon: LogOut, active: false, action: () => setShowLogoutConfirm(true) },
      ];
    } else {
      // Admin and Staff navigation
      return [
        { name: "Dashboard", icon: LayoutDashboard, page: "dashboard", active: currentPage === 'dashboard' },
        { name: "Rooms", icon: DoorOpen, page: "rooms", active: currentPage === 'rooms' },
        { name: "Payment", icon: PhilippinePeso, page: "payment", active: currentPage === 'payment' || currentPage === 'payment-history' },
        { name: "Reports", icon: Wrench, page: "reports", active: currentPage === 'reports' },
        { name: "Users", icon: User, page: "users", active: currentPage === 'users' },
        { name: "Notifications", icon: BellDot, page: "notifications", active: currentPage === 'notifications' },
        { name: "Announcements", icon: Megaphone, page: "announcements", active: currentPage === 'announcements' },
        { name: "Logout", icon: LogOut, active: false, action: () => setShowLogoutConfirm(true) },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="35"
            viewBox="0 0 98 78"
            fill="none"
            className="lg:w-[60px] lg:h-[50px]"
          >
            <g mask="url(#mask0)">
              <path
                d="M70.7867 0H26.5453L0.402677 27.4517L9.65315 26.9134V56.6976L2.61475 57.4153C2.61475 57.4153 -0.803907 57.9535 0.00048206 61.1831C0.804871 63.5156 3.41914 63.5156 3.41914 63.5156L9.65315 62.6185V70.5131L53.6935 77.69L88.2822 70.6926V27.6311L97.7338 26.9134C97.5327 26.734 70.7867 0 70.7867 0ZM61.7374 32.6549L71.39 31.7578V43.0615L61.7374 44.138V32.6549ZM12.8707 68.5395V62.2597L31.975 59.3889C31.975 59.3889 35.1925 59.3889 34.9914 56.1593C34.7903 53.2885 31.1706 53.8268 31.1706 53.8268L12.8707 56.3387V26.0163L32.176 5.74153L53.6935 26.9134V74.9987L12.8707 68.5395ZM61.7374 59.5683V47.9059L71.39 46.8293V58.133L61.7374 59.5683ZM83.2548 56.1593L75.2109 57.4153V46.2911L83.2548 45.2145V56.1593ZM75.412 42.7026V31.5784L83.4559 30.8607V41.8055C83.2548 41.8055 75.412 42.7026 75.412 42.7026ZM41.2254 27.8105C39.0134 25.478 35.9969 24.0426 32.5782 24.0426H31.975C28.5563 24.2221 25.7409 25.8369 23.73 28.1694C21.719 30.5019 20.5124 33.7315 20.5124 37.1405V38.0376C20.7135 41.6261 22.1212 44.8557 24.3333 47.0088C26.5453 49.3412 29.5618 50.7766 32.9804 50.7766H33.5837C37.0024 50.5972 39.8177 48.9824 41.8287 46.6499C43.8397 44.3174 45.0463 41.0878 45.0463 37.6788V36.7817C44.8452 33.3726 43.4375 30.143 41.2254 27.8105ZM39.8177 45.3939C38.209 47.3676 35.7958 48.6236 33.3826 48.6236H32.9804C30.3662 48.6236 27.953 47.547 26.1431 45.5734C24.3333 43.5997 22.9256 40.9084 22.9256 37.8582V37.1405C22.9256 34.0903 23.9311 31.399 25.7409 29.4253C27.3497 27.4517 29.7629 26.1957 32.176 26.1957H32.5782C35.1925 26.1957 37.6057 27.2723 39.4156 29.2459C41.2254 31.2196 42.6331 33.9109 42.6331 36.9611V37.6788C42.6331 40.729 41.6276 43.4203 39.8177 45.3939ZM28.5563 37.6788C28.3552 33.9109 29.7629 30.5019 31.7739 29.2459C28.1541 29.4253 25.3387 33.3726 25.7409 37.8582C25.942 42.5232 29.1596 46.1116 32.7793 45.9322C30.5673 44.8557 28.7574 41.6261 28.5563 37.6788Z"
                fill="#116DB3"
              />
            </g>
          </svg>
          <span className="text-lg lg:text-xl font-semibold text-gray-800">
            BoarderMate
          </span>
        </div>

        {/* User Profile moved to TopNavbar */}
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 flex-1">
        {navigationItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              if (item.action) {
                item.action();
              } else if (item.page && onNavigate) {
                onNavigate(item.page);
              }
              // Close mobile menu when item is clicked
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center px-4 lg:px-6 py-3 w-full text-left transition-colors ${
              item.active
                ? "bg-blue-50 border-r-4 border-blue-600 text-blue-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
            <span className="text-sm lg:text-base">{item.name}</span>
          </button>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-500 hover:text-gray-700 transition-colors"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-64 lg:bg-white lg:shadow-lg lg:z-30 lg:flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close button for mobile */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebarContent}
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && !isLoggingOut && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logging Out Animation Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-xl font-semibold">Logging out...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;