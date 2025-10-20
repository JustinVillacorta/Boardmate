import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import TenantInfoCards from "../../components/tenant/TenantInfoCards";
import TenantQuickActions from "../../components/tenant/TenantQuickActions";
import TenantRecentActivity from "../../components/tenant/TenantRecentActivity";

interface DashboardProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentPage, onNavigate }) => {
  // Hardcoded static data for tenant info
  const tenantData = {
    room: "203",
    roomType: "Single Room",
    monthlyRent: 3450,
    nextPaymentDue: "2024-02-01",
    accountStatus: "Active"
  };

  const handleViewPaymentHistory = () => {
    if (onNavigate) {
      onNavigate('payments');
    }
  };

  const handleSubmitMaintenanceRequest = () => {
    if (onNavigate) {
      onNavigate('reports');
    }
  };

  const handleUpdateProfile = () => {
    if (onNavigate) {
      onNavigate('profile');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar currentPage={currentPage} />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-4 lg:space-y-6">

          {/* Tenant Info Cards */}
          <TenantInfoCards tenantData={tenantData} />
          
          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {/* Quick Actions */}
            <TenantQuickActions 
              onViewPaymentHistory={handleViewPaymentHistory}
              onSubmitMaintenanceRequest={handleSubmitMaintenanceRequest}
              onUpdateProfile={handleUpdateProfile}
            />
            
            {/* Recent Activity */}
            <TenantRecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
