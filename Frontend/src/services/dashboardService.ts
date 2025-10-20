import api from '../config/api';

// Types local to the dashboard service to avoid broad type coupling
export type DashboardData = {
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    maintenanceRooms: number;
    occupancyRate: number;
  };
  stats: {
    tenants: {
      total: number;
      active: number;
    };
  };
  payments: {
    thisMonth: {
      amount: number;
      count: number;
    };
    byStatus: {
      paid: {
        count: number;
      };
    };
    monthlyTrends: Array<{
      month: string;
      collected: number; // paidAmount
      overdue: number; // overdueAmount
      amount: number; // totalAmount
    }>;
  };
  reports: {
    total: number;
    byStatus: {
      pending: number;
    };
  };
};

function getMonthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'short' });
}

export const dashboardService = {
  async fetchAdminDashboard(): Promise<DashboardData> {
    // Current date for monthly stats
    const now = new Date();

    // Prepare last 4 months including current
    const months: { year: number; month: number; label: string }[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: getMonthLabel(d) });
    }

    // Parallel base requests
    const [roomsRes, tenantsRes, reportsRes] = await Promise.all([
      api.get('/rooms/stats'),
      api.get('/auth/tenants-only', { params: { limit: 1 } }),
      api.get('/reports', { params: { limit: 1 } }),
    ]);

    // Payment stats for each of the last 4 months in parallel
    const paymentMonthPromises = months.map(({ year, month }) =>
      api.get('/payments/stats', { params: { year, month } })
    );
    const paymentMonthResponses = await Promise.all(paymentMonthPromises);

    // Map occupancy
    const roomOverview = roomsRes.data?.data?.overview || {};
    const occupancy = {
      totalRooms: Number(roomOverview.totalRooms) || 0,
      occupiedRooms: Number(roomOverview.occupiedRooms) || 0,
      availableRooms: Number(roomOverview.availableRooms) || 0,
      maintenanceRooms: Number(roomOverview.maintenanceRooms) || 0,
      occupancyRate: Math.round((Number(roomOverview.occupancyRate) || 0)),
    };

    // Map tenants
    const tenantSummary = tenantsRes.data?.data?.summary || {};
    const stats = {
      tenants: {
        total: Number(tenantSummary.totalTenants) || 0,
        active: Number(tenantSummary.activeTenants) || 0,
      },
    };

    // Map payments
    const monthlyTrends = paymentMonthResponses.map((resp, idx) => {
      const s = resp.data?.data?.summary || {};
      return {
        month: months[idx].label,
        collected: Number(s.paidAmount) || 0,
        overdue: Number(s.overdueAmount) || 0,
        amount: Number(s.totalAmount) || 0,
      };
    });

    const currentSummary = paymentMonthResponses[paymentMonthResponses.length - 1]?.data?.data?.summary || {};
    const payments = {
      thisMonth: {
        amount: Number(currentSummary.totalAmount) || 0,
        count: Number(currentSummary.totalPayments) || 0,
      },
      byStatus: {
        paid: {
          count: Number(currentSummary.paidCount) || 0,
        },
      },
      monthlyTrends,
    };

    // Map reports
    const reportStats = reportsRes.data?.stats || null;
    const reports = {
      total: Number(reportStats?.total) || 0,
      byStatus: {
        pending: Number((reportStats?.status || []).find((s: any) => s._id === 'pending')?.count) || 0,
      },
    };

    return {
      occupancy,
      stats,
      payments,
      reports,
    };
  },
};

export default dashboardService;


