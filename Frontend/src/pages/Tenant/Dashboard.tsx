import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import TenantInfoCards from "../../components/tenant/TenantInfoCards";
import TenantQuickActions from "../../components/tenant/TenantQuickActions";
import TenantRecentActivity from "../../components/tenant/TenantRecentActivity";
import LoadingState from "../../components/ui/LoadingState";
import { tenantDashboardService, type TenantDashboardData } from "../../services/tenantDashboardService";

interface DashboardProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentPage, onNavigate, onLogout }) => {
  const [data, setData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await tenantDashboardService.fetchTenantDashboard();
      setData(result);
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Refetch dashboard data when currentPage changes to 'dashboard'
    if (currentPage === 'dashboard') {
      fetchDashboardData();
    }
  }, [currentPage, fetchDashboardData]);

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

  const handleViewAnnouncements = () => {
    if (onNavigate) {
      onNavigate('announcements');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
  {/* Top Navigation */}
  <TopNavbar currentPage={currentPage} onNotificationOpen={() => onNavigate && onNavigate('notifications')} onAnnouncementOpen={() => onNavigate && onNavigate('announcements')} />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-4 lg:space-y-6">
          {/* Loading / Error states */}
          {loading && (
            <LoadingState
              message="Loading your dashboard"
              description="We are retrieving your room, payment, and activity updates."
            />
          )}
          {error && !loading && (
            <div className="text-red-600">{error}</div>
          )}

          {/* Tenant Info Cards */}
          {data && (
            <TenantInfoCards 
              tenant={data.tenant}
              nextPaymentDue={data.nextPaymentDue}
            />
          )}
          
          {/* Dashboard Sections */}
          {data && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {/* Quick Actions */}
              <TenantQuickActions 
                onViewPaymentHistory={handleViewPaymentHistory}
                onSubmitMaintenanceRequest={handleSubmitMaintenanceRequest}
                onUpdateProfile={handleUpdateProfile}
                onViewAnnouncements={handleViewAnnouncements}
              />
              
              {/* Recent Activity */}
              <TenantRecentActivity 
                payments={data.payments}
                reports={data.reports}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
