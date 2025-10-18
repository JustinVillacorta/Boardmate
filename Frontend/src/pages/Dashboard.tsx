import React from "react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import MetricCards from "../components/dashboard/MetricCards";
import Charts from "../components/dashboard/Charts";

// Types for data structure
type PaymentData = {
  month: string;
  collected: number;
  overdue: number;
  amount: number;
};

const Dashboard: React.FC = () => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar />

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto space-y-4 lg:space-y-6">
          {/* Metric Cards */}
          <MetricCards data={data} />
          
          {/* Charts Section */}
          <Charts data={data} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;