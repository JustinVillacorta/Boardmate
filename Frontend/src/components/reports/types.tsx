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
}

export default ReportItem;
