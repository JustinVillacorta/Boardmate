import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import MetricCards from "../../components/dashboard/MetricCards";
import RecentTenancyChanges from "../../components/dashboard/RecentTenancyChanges";
import QuickActions from "../../components/dashboard/QuickActions";
import CreateUserModal from "../../components/users/CreateUserModal";

// Types for data structure
type PaymentData = {
  month: string;
  collected: number;
  overdue: number;
  amount: number;
};

interface DashboardProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentPage, onNavigate, onLogout }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sample payment data
  const SAMPLE_PAYMENTS: PaymentData[] = [
    { month: "Jan", collected: 13500, overdue: 500, amount: 14000 },
    { month: "Feb", collected: 13200, overdue: 700, amount: 13900 },
    { month: "Mar", collected: 13800, overdue: 600, amount: 14400 },
    { month: "Apr", collected: 13000, overdue: 900, amount: 13900 },
  ];

  // Mock data - replace with actual data fetching
  const data = {
    occupancy: {
      totalRooms: 5,
      occupiedRooms: 2,
      availableRooms: 2,
      maintenanceRooms: 1,
      occupancyRate: 40
    },
    stats: {
      tenants: {
        total: 2,
        active: 2
      }
    },
    payments: {
      thisMonth: {
        amount: 100000800,
        count: 4
      },
      byStatus: {
        paid: {
          count: 6
        }
      },
      monthlyTrends: SAMPLE_PAYMENTS
    },
    reports: {
      total: 1,
      byStatus: {
        pending: 0
      }
    }
  };

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
    // Placeholder for future maintenance feature
    console.log('Maintenance request feature coming soon');
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
        <TopNavbar currentPage={currentPage} />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-4 lg:space-y-6">
          {/* Metric Cards */}
          <MetricCards data={data} />
          
          {/* Staff Dashboard Sections */}
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
