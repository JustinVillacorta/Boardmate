import api from '../config/api';
import { ReportItem } from '../types/report';

export interface GetReportsParams {
  page?: number;
  limit?: number;
  tenant?: string;
  room?: string;
  type?: string;
  status?: string | string[];
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
}

export interface GetReportsResponse {
  success: boolean;
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalReports: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: any;
  data: {
    reports: ReportItem[];
  };
}

export const reportService = {
  async getReports(params: GetReportsParams = {}): Promise<GetReportsResponse> {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) {
          v.forEach(val => query.append(k, val));
        } else {
          query.append(k, String(v));
        }
      }
    });

    // cache bust
    query.append('_t', Date.now().toString());

    const res = await api.get<GetReportsResponse>(`/reports?${query.toString()}`);
    return res.data;
  },

  async getReport(id: string) {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  async createReport(payload: any) {
    const res = await api.post('/reports', payload);
    return res.data;
  },

  async updateReport(id: string, payload: any) {
    const res = await api.put(`/reports/${id}`, payload);
    return res.data;
  },

  async deleteReport(id: string) {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  },

  async followUpReport(id: string) {
    const res = await api.put(`/reports/${id}/follow-up`, {});
    return res.data;
  }
};
