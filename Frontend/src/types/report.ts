// Report types
export interface ReportItem {
  id: string;
  title: string;
  tags?: string[];
  description?: string;
  reporter?: string;
  createdAt: string;
  updatedAt?: string;
  room?: string;
  daysOpen?: number;
  status: 'Resolved' | 'In Progress' | 'Pending' | 'Rejected';
  followUp?: boolean;
  followUpDate?: string;
  isArchived?: boolean;
}

export interface Report {
  _id: string;
  title: string;
  type: 'financial' | 'occupancy' | 'maintenance' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  generatedBy: string;
  createdAt: string;
  isArchived?: boolean;
}