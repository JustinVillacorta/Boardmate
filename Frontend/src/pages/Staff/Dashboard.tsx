import React, { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import MetricCards from "../../components/dashboard/MetricCards";
import RecentTenancyChanges from "../../components/dashboard/RecentTenancyChanges";
import QuickActions from "../../components/dashboard/QuickActions";
import CreateUserModal from "../../components/users/CreateUserModal";
import { dashboardService, type DashboardData } from "../../services/dashboardService";

interface DashboardProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentPage, onNavigate, onLogout }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await dashboardService.fetchStaffDashboard();
        if (isMounted) {
          setData(result);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateUser = (userData: any) => {
    // Handle user creation - replace with actual API call
    console.log('Creating tenant user:', userData);
    setIsCreateModalOpen(false);
  };

  const handleAddTenant = () => {
    setIsCreateModalOpen(true);
  };

  const handleRecordPayment = () => {
    if (onNavigate) {
      onNavigate('payment');
    }
  };

  const handleMaintenanceRequest = () => {
    if (onNavigate) {
      onNavigate('reports');
    }
  };

  const handleCheckAvailability = () => {
    if (onNavigate) {
      onNavigate('rooms');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
  {/* Top Navigation */}
  <TopNavbar currentPage={currentPage} onNotificationOpen={() => onNavigate && onNavigate('notifications')} />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-4 lg:space-y-6">
          {/* Loading / Error states */}
          {loading && (
            <div className="text-gray-600">Loading dashboard...</div>
          )}
          {error && !loading && (
            <div className="text-red-600">{error}</div>
          )}
          
          {/* Metric Cards */}
          {data && <MetricCards data={data} />}
          
          {/* Staff Dashboard Sections */}
          {data && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {/* Recent Tenancy Changes */}
              <RecentTenancyChanges />
              
              {/* Quick Actions */}
              <QuickActions 
                onAddTenant={handleAddTenant}
                onRecordPayment={handleRecordPayment}
                onMaintenanceRequest={handleMaintenanceRequest}
                onCheckAvailability={handleCheckAvailability}
                userRole="staff"
              />
            </div>
          )}
        </main>
      </div>

      {/* Create User Modal - Tenant Only */}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateUser}
          isStaffUser={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
