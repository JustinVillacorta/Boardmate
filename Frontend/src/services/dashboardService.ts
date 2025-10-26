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
  async fetchStaffDashboard(): Promise<DashboardData> {
    // Staff has same access as admin for dashboard data
    return this.fetchAdminDashboard();
  },
  
  async fetchAdminDashboard(): Promise<DashboardData> {
    try {
      // Current date for monthly stats
      const now = new Date();

      // Prepare all 12 months of the current year
      const months: { year: number; month: number; label: string }[] = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: getMonthLabel(d) });
      }

      // Parallel base requests with error handling
      const [roomsRes, tenantsRes, reportsRes] = await Promise.allSettled([
        api.get('/rooms/stats'),
        api.get('/auth/tenants-only', { params: { limit: 1, isArchived: false } }),
        api.get('/reports', { params: { limit: 1, includeArchivedUsers: false } }),
      ]);

      // Payment stats for each of the last 4 months in parallel
      const paymentMonthPromises = months.map(({ year, month }) =>
        api.get('/payments/stats', { params: { year, month } }).catch(() => ({ data: { data: { summary: {} } } }))
      );
      const paymentMonthResponses = await Promise.all(paymentMonthPromises);

      // Map occupancy with fallback
      const roomOverview = roomsRes.status === 'fulfilled' ? roomsRes.value.data?.data?.overview || {} : {};
      const occupancy = {
        totalRooms: Number(roomOverview.totalRooms) || 0,
        occupiedRooms: Number(roomOverview.occupiedRooms) || 0,
        availableRooms: Number(roomOverview.availableRooms) || 0,
        maintenanceRooms: Number(roomOverview.maintenanceRooms) || 0,
        occupancyRate: Math.round((Number(roomOverview.occupancyRate) || 0)),
      };

      // Map tenants with fallback
      const tenantSummary = tenantsRes.status === 'fulfilled' ? tenantsRes.value.data?.data?.summary || {} : {};
      const stats = {
        tenants: {
          total: Number(tenantSummary.totalTenants) || 0,
          active: Number(tenantSummary.activeTenants) || 0,
        },
      };

      // Map payments with fallback
      const monthlyTrends = paymentMonthResponses.map((resp, idx) => {
        const s = resp.data?.data?.summary || {};
        return {
          month: months[idx].label,
          collected: Number(s.paidAmount) || 0,
          overdue: Number(s.overdueAmount) || 0,
          amount: Number(s.totalAmount) || 0,
        };
      });

      // Get current month's data (current month index is now.month - 1)
      const currentMonthIndex = now.getMonth();
      const currentSummary = paymentMonthResponses[currentMonthIndex]?.data?.data?.summary || {};
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

      // Map reports with fallback
      const reportStats = reportsRes.status === 'fulfilled' ? reportsRes.value.data?.stats || null : null;
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
    } catch (error) {
      console.error('Dashboard API error:', error);
      // Return empty data structure if all APIs fail
      return {
        occupancy: {
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          maintenanceRooms: 0,
          occupancyRate: 0,
        },
        stats: {
          tenants: {
            total: 0,
            active: 0,
          },
        },
        payments: {
          thisMonth: {
            amount: 0,
            count: 0,
          },
          byStatus: {
            paid: {
              count: 0,
            },
          },
          monthlyTrends: [],
        },
        reports: {
          total: 0,
          byStatus: {
            pending: 0,
          },
        },
      };
    }
  },
};

export default dashboardService;


