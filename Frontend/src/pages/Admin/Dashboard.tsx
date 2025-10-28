import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import MetricCards from "../../components/dashboard/MetricCards";
import Charts from "../../components/dashboard/Charts";
import LoadingState from "../../components/ui/LoadingState";
import DashboardSkeleton from "../../components/skeletons/DashboardSkeleton";
import { dashboardService, type DashboardData } from "../../services/dashboardService";

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const result = await dashboardService.fetchAdminDashboard();
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
            <LoadingState message="Preparing your dashboard" description="Hang tight while we gather the latest stats.">
              <DashboardSkeleton />
            </LoadingState>
          )}
          {error && !loading && (
            <div className="text-red-600">{error}</div>
          )}
          {/* Metric Cards */}
          {data && <MetricCards data={data} />}
          
          {/* Charts Section */}
          {data && <Charts data={data} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;