import api from '../config/api';
import { reportService } from './reportService';
import { PaymentService } from './paymentService';

export interface TenantDashboardData {
  tenant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    tenantStatus: 'active' | 'inactive' | 'pending';
    room?: {
      _id: string;
      roomNumber: string;
      roomType: string;
      monthlyRent: number;
    };
    monthlyRent: number;
    leaseStartDate: string;
    leaseEndDate?: string;
  };
  payments: any[];
  reports: any[];
  nextPaymentDue: {
    date: string | null;
    status: 'paid' | 'pending' | 'overdue';
    daysRemaining: number;
  };
}

function calculateNextPaymentDue(payments: any[], leaseStartDate: string) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Find current month's payment
  const currentPayment = payments.find(p => {
    const dueDate = new Date(p.dueDate);
    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
  });

  if (currentPayment?.status === 'paid') {
    // Show next month's payment
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    const nextPayment = payments.find(p => {
      const dueDate = new Date(p.dueDate);
      return dueDate.getMonth() === nextMonth.getMonth() && 
             dueDate.getFullYear() === nextMonth.getFullYear();
    });

    if (nextPayment) {
      const dueDate = new Date(nextPayment.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        date: nextPayment.dueDate,
        status: nextPayment.status as 'paid' | 'pending' | 'overdue',
        daysRemaining: diffDays > 0 ? diffDays : 0
      };
    } else {
      // Calculate next month from lease start date
      const leaseStart = new Date(leaseStartDate);
      const nextDueDate = new Date(currentYear, currentMonth + 1, leaseStart.getDate());
      const diffTime = nextDueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        date: nextDueDate.toISOString(),
        status: 'pending' as const,
        daysRemaining: diffDays > 0 ? diffDays : 0
      };
    }
  } else if (currentPayment) {
    // Current month payment exists but not paid - show as overdue
    return {
      date: currentPayment.dueDate,
      status: 'overdue' as const,
      daysRemaining: 0
    };
  } else {
    // No payment record for current month - calculate from lease start
    const leaseStart = new Date(leaseStartDate);
    const currentDueDate = new Date(currentYear, currentMonth, leaseStart.getDate());
    const diffTime = currentDueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      date: currentDueDate.toISOString(),
      status: diffDays < 0 ? 'overdue' as const : 'pending' as const,
      daysRemaining: diffDays > 0 ? diffDays : 0
    };
  }
}

export const tenantDashboardService = {
  async fetchTenantDashboard(): Promise<TenantDashboardData> {
    try {
      // Fetch tenant profile with room info
      const meResponse = await api.get('/auth/me');
      const tenantData = meResponse.data.data.tenant;

      if (!tenantData) {
        throw new Error('Tenant data not found');
      }

      const tenantId = tenantData._id;

      // Fetch payments and reports in parallel
      const [paymentsResponse, reportsResponse] = await Promise.allSettled([
        PaymentService.tenantPayments(tenantId, { limit: 50, sortBy: 'dueDate', sortOrder: 'desc' }),
        reportService.getReports({ tenant: tenantId, limit: 10, sortBy: 'updatedAt' })
      ]);

      const payments = paymentsResponse.status === 'fulfilled' 
        ? paymentsResponse.value.data?.payments || [] 
        : [];
      
      const reports = reportsResponse.status === 'fulfilled' 
        ? reportsResponse.value.data?.reports || [] 
        : [];

      // Calculate next payment due
      const nextPaymentDue = calculateNextPaymentDue(
        payments, 
        tenantData.leaseStartDate || new Date().toISOString()
      );

      return {
        tenant: {
          _id: tenantData._id,
          firstName: tenantData.firstName,
          lastName: tenantData.lastName,
          email: tenantData.email,
          tenantStatus: tenantData.tenantStatus,
          room: tenantData.room,
          monthlyRent: tenantData.monthlyRent,
          leaseStartDate: tenantData.leaseStartDate,
          leaseEndDate: tenantData.leaseEndDate
        },
        payments,
        reports,
        nextPaymentDue
      };
    } catch (error: any) {
      console.error('Failed to fetch tenant dashboard data:', error);
      throw new Error(error.response?.data?.message || 'Failed to load dashboard data');
    }
  }
};

export default tenantDashboardService;

