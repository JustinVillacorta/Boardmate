import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import Report from '../models/Report.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

// Helper function to parse date strings
const parseDate = (month, year, day = 1) => {
  const months = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  return new Date(year, months[month], day);
};

// Staff/Admin Users
const users = [
  {
    name: 'Staff001',
    email: 'staff001@boardmate.com',
    password: 'Staff001@2024',
    role: 'staff'
  },
  {
    name: 'Staff002',
    email: 'staff002@boardmate.com',
    password: 'Staff002@2024',
    role: 'staff'
  },
  {
    name: 'Staff003',
    email: 'staff003@boardmate.com',
    password: 'Staff003@2024',
    role: 'staff'
  },
  {
    name: 'Admin',
    email: 'admin@boardmate.com',
    password: 'Admin@2024',
    role: 'admin'
  }
];

// Room configurations
const roomConfigs = {
  'single': { capacity: 1, monthlyRent: 5000, securityDeposit: 5000 },
  'double': { capacity: 2, monthlyRent: 8000, securityDeposit: 8000 },
  'triple': { capacity: 3, monthlyRent: 12000, securityDeposit: 12000 },
  'quad': { capacity: 4, monthlyRent: 15000, securityDeposit: 15000 }
};

// Unique room numbers from dataset
const roomNumbers = [
  { number: 'R101', type: 'single' },
  { number: 'R102', type: 'double' },
  { number: 'R103', type: 'single' },
  { number: 'R104', type: 'triple' },
  { number: 'R105', type: 'single' },
  { number: 'R106', type: 'single' },
  { number: 'R107', type: 'double' },
  { number: 'R108', type: 'triple' },
  { number: 'R109', type: 'single' },
  { number: 'R110', type: 'quad' }
];

// Tenant data from dataset
const tenantData = [
  { id: 'T001', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', room: 'R101' },
  { id: 'T002', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@email.com', room: 'R102' },
  { id: 'T003', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@email.com', room: 'R103' },
  { id: 'T004', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@email.com', room: 'R104' },
  { id: 'T005', firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', room: 'R105' },
  { id: 'T006', firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@email.com', room: 'R103' },
  { id: 'T007', firstName: 'Alex', lastName: 'Rodriguez', email: 'alex.rodriguez@email.com', room: 'R106' },
  { id: 'T008', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@email.com', room: 'R107' },
  { id: 'T009', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@email.com', room: 'R108' },
  { id: 'T010', firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@email.com', room: 'R109' },
  { id: 'T011', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@email.com', room: 'R110' }
];

// Payment data from dataset - Complete records from January to August 2024
const paymentRecords = [
  // January 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T003', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-01-14', dueDate: '2024-01-01', status: 'overdue', daysLate: 13 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  // January 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-01-16', dueDate: '2024-01-01', status: 'overdue', daysLate: 15 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-01-01', dueDate: '2024-01-01', status: 'paid', daysLate: 0 },
  
  // February 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-02-01', dueDate: '2024-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-02-01', dueDate: '2024-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-02-01', dueDate: '2024-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-02-08', dueDate: '2024-02-01', status: 'overdue', daysLate: 7 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-02-19', dueDate: '2024-02-01', status: 'overdue', daysLate: 18 },
  // February 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-02-01', dueDate: '2024-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-02-01', dueDate: '2024-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-02-10', dueDate: '2024-02-01', status: 'overdue', daysLate: 9 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-02-18', dueDate: '2024-02-01', status: 'overdue', daysLate: 17 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-02-01', dueDate: '2024-02-01', status: 'paid', daysLate: 0 },
  
  // March 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-03-04', dueDate: '2024-03-01', status: 'paid', daysLate: 3 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-03-01', dueDate: '2024-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-03-01', dueDate: '2024-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-03-12', dueDate: '2024-03-01', status: 'overdue', daysLate: 11 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-03-01', dueDate: '2024-03-01', status: 'paid', daysLate: 0 },
  // March 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-03-14', dueDate: '2024-03-01', status: 'overdue', daysLate: 13 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-03-14', dueDate: '2024-03-01', status: 'overdue', daysLate: 13 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-03-01', dueDate: '2024-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-03-16', dueDate: '2024-03-01', status: 'overdue', daysLate: 15 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-03-01', dueDate: '2024-03-01', status: 'paid', daysLate: 0 },
  
  // April 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-04-04', dueDate: '2024-04-01', status: 'paid', daysLate: 3 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-04-17', dueDate: '2024-04-01', status: 'overdue', daysLate: 16 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  // April 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-04-01', dueDate: '2024-04-01', status: 'paid', daysLate: 0 },
  
  // May 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  // May 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-05-01', dueDate: '2024-05-01', status: 'paid', daysLate: 0 },
  
  // June 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-06-09', dueDate: '2024-06-01', status: 'overdue', daysLate: 8 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-06-05', dueDate: '2024-06-01', status: 'paid', daysLate: 4 },
  // June 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-06-14', dueDate: '2024-06-01', status: 'overdue', daysLate: 13 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-06-01', dueDate: '2024-06-01', status: 'paid', daysLate: 0 },
  
  // July 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-07-07', dueDate: '2024-07-01', status: 'paid', daysLate: 6 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-07-11', dueDate: '2024-07-01', status: 'overdue', daysLate: 10 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  // July 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-07-01', dueDate: '2024-07-01', status: 'paid', daysLate: 0 },
  
  // August 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-08-10', dueDate: '2024-08-01', status: 'overdue', daysLate: 9 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  // August 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-08-08', dueDate: '2024-08-01', status: 'overdue', daysLate: 7 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-08-01', dueDate: '2024-08-01', status: 'paid', daysLate: 0 },
  
  // September 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-09-10', dueDate: '2024-09-01', status: 'overdue', daysLate: 9 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  // September 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-09-01', dueDate: '2024-09-01', status: 'paid', daysLate: 0 },
  
  // October 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-10-04', dueDate: '2024-10-01', status: 'paid', daysLate: 3 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  // October 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-10-01', dueDate: '2024-10-01', status: 'paid', daysLate: 0 },
  
  // November 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  // November 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-11-01', dueDate: '2024-11-01', status: 'paid', daysLate: 0 },
  
  // December 2024 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  // December 2024 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2024-12-01', dueDate: '2024-12-01', status: 'paid', daysLate: 0 },
  
  // ========== 2025 DATA ==========
  
  // January 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-01-05', dueDate: '2025-01-01', status: 'paid', daysLate: 4 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  // January 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-01-01', dueDate: '2025-01-01', status: 'paid', daysLate: 0 },
  
  // February 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  // February 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-02-08', dueDate: '2025-02-01', status: 'overdue', daysLate: 7 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-02-01', dueDate: '2025-02-01', status: 'paid', daysLate: 0 },
  
  // March 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  // March 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-03-01', dueDate: '2025-03-01', status: 'paid', daysLate: 0 },
  
  // April 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  // April 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-04-01', dueDate: '2025-04-01', status: 'paid', daysLate: 0 },
  
  // May 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-05-06', dueDate: '2025-05-01', status: 'paid', daysLate: 5 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  // May 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-05-01', dueDate: '2025-05-01', status: 'paid', daysLate: 0 },
  
  // June 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  // June 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-06-01', dueDate: '2025-06-01', status: 'paid', daysLate: 0 },
  
  // July 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  // July 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-07-01', dueDate: '2025-07-01', status: 'paid', daysLate: 0 },
  
  // August 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  // August 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-08-01', dueDate: '2025-08-01', status: 'paid', daysLate: 0 },
  
  // September 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  // September 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-09-01', dueDate: '2025-09-01', status: 'paid', daysLate: 0 },
  
  // October 2025 - Rooms R101-R105
  { tenantId: 'T001', roomNumber: 'R101', amount: 5000, type: 'rent', method: 'cash', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T002', roomNumber: 'R102', amount: 8000, type: 'rent', method: 'bank_transfer', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T006', roomNumber: 'R103', amount: 5000, type: 'rent', method: 'cash', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T004', roomNumber: 'R104', amount: 12000, type: 'rent', method: 'check', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T005', roomNumber: 'R105', amount: 5000, type: 'rent', method: 'cash', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  // October 2025 - Rooms R106-R110
  { tenantId: 'T007', roomNumber: 'R106', amount: 5500, type: 'rent', method: 'cash', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T008', roomNumber: 'R107', amount: 7500, type: 'rent', method: 'bank_transfer', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T009', roomNumber: 'R108', amount: 11000, type: 'rent', method: 'check', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T010', roomNumber: 'R109', amount: 4800, type: 'rent', method: 'cash', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 },
  { tenantId: 'T011', roomNumber: 'R110', amount: 15000, type: 'rent', method: 'bank_transfer', date: '2025-10-01', dueDate: '2025-10-01', status: 'paid', daysLate: 0 }
];

// Report data from dataset - Extended for 2024-2025
const reportRecords = [
  // 2024 Reports
  { reportId: 'MR001', type: 'complaint', title: 'Air conditioning repair', status: 'resolved', submittedAt: '2024-01-07', resolvedAt: '2024-01-09', recordedBy: 'Staff001', notes: 'AC unit not cooling properly', tenantId: 'T001', roomNumber: 'R101' },
  { reportId: 'MR002', type: 'other', title: 'Noisy neighbors', status: 'resolved', submittedAt: '2024-01-20', resolvedAt: '2024-01-22', recordedBy: 'Staff002', notes: 'Resolved through mediation', tenantId: 'T002', roomNumber: 'R102' },
  { reportId: 'MR003', type: 'other', title: 'Water leak in bathroom', status: 'resolved', submittedAt: '2024-01-12', resolvedAt: '2024-01-14', recordedBy: 'Staff001', notes: 'Plumbing issue fixed', tenantId: 'T003', roomNumber: 'R103' },
  { reportId: 'MR004', type: 'other', title: 'Internet connectivity issues', status: 'resolved', submittedAt: '2024-01-17', resolvedAt: '2024-01-19', recordedBy: 'Staff003', notes: 'Router replaced', tenantId: 'T004', roomNumber: 'R104' },
  { reportId: 'MR005', type: 'complaint', title: 'Door lock malfunction', status: 'resolved', submittedAt: '2024-01-11', resolvedAt: '2024-01-13', recordedBy: 'Staff001', notes: 'Lock mechanism replaced', tenantId: 'T005', roomNumber: 'R105' },
  { reportId: 'MR006', type: 'maintenance', title: 'Air conditioning service', status: 'resolved', submittedAt: '2024-02-22', resolvedAt: '2024-02-24', recordedBy: 'Staff001', notes: 'AC unit serviced successfully', tenantId: 'T001', roomNumber: 'R101' },
  { reportId: 'MR007', type: 'maintenance', title: 'Heating not working', status: 'resolved', submittedAt: '2024-02-08', resolvedAt: '2024-02-10', recordedBy: 'Staff002', notes: 'Heater repaired', tenantId: 'T002', roomNumber: 'R102' },
  { reportId: 'MR008', type: 'complaint', title: 'Window repair needed', status: 'resolved', submittedAt: '2024-02-10', resolvedAt: '2024-02-12', recordedBy: 'Staff001', notes: 'Window frame replaced', tenantId: 'T006', roomNumber: 'R103' },
  { reportId: 'MR009', type: 'complaint', title: 'Light fixture replacement', status: 'resolved', submittedAt: '2024-02-11', resolvedAt: '2024-02-13', recordedBy: 'Staff003', notes: 'LED lights installed', tenantId: 'T004', roomNumber: 'R104' },
  { reportId: 'MR010', type: 'complaint', title: 'Door lock malfunction', status: 'resolved', submittedAt: '2024-02-12', resolvedAt: '2024-02-13', recordedBy: 'Staff001', notes: 'Lock replaced', tenantId: 'T005', roomNumber: 'R105' },
  { reportId: 'MR011', type: 'maintenance', title: 'Plumbing inspection', status: 'resolved', submittedAt: '2024-03-05', resolvedAt: '2024-03-06', recordedBy: 'Staff001', notes: 'Routine maintenance completed', tenantId: 'T007', roomNumber: 'R106' },
  { reportId: 'MR012', type: 'complaint', title: 'WiFi signal weak', status: 'resolved', submittedAt: '2024-03-10', resolvedAt: '2024-03-12', recordedBy: 'Staff003', notes: 'Router upgraded', tenantId: 'T008', roomNumber: 'R107' },
  { reportId: 'MR013', type: 'maintenance', title: 'Ceiling fan noise', status: 'resolved', submittedAt: '2024-04-15', resolvedAt: '2024-04-16', recordedBy: 'Staff001', notes: 'Fan motor lubricated', tenantId: 'T009', roomNumber: 'R108' },
  { reportId: 'MR014', type: 'other', title: 'Paint touch-up needed', status: 'resolved', submittedAt: '2024-04-20', resolvedAt: '2024-04-22', recordedBy: 'Staff002', notes: 'Walls repainted', tenantId: 'T010', roomNumber: 'R109' },
  { reportId: 'MR015', type: 'complaint', title: 'Kitchen sink clogged', status: 'resolved', submittedAt: '2024-05-03', resolvedAt: '2024-05-04', recordedBy: 'Staff001', notes: 'Drain cleared', tenantId: 'T011', roomNumber: 'R110' },
  { reportId: 'MR016', type: 'maintenance', title: 'Electrical outlet not working', status: 'resolved', submittedAt: '2024-05-12', resolvedAt: '2024-05-13', recordedBy: 'Staff003', notes: 'Outlet replaced', tenantId: 'T001', roomNumber: 'R101' },
  { reportId: 'MR017', type: 'complaint', title: 'Shower pressure low', status: 'resolved', submittedAt: '2024-06-08', resolvedAt: '2024-06-09', recordedBy: 'Staff001', notes: 'Shower head cleaned', tenantId: 'T002', roomNumber: 'R102' },
  { reportId: 'MR018', type: 'other', title: 'Furniture repair request', status: 'resolved', submittedAt: '2024-06-15', resolvedAt: '2024-06-17', recordedBy: 'Staff002', notes: 'Bed frame reinforced', tenantId: 'T006', roomNumber: 'R103' },
  { reportId: 'MR019', type: 'maintenance', title: 'Smoke detector battery', status: 'resolved', submittedAt: '2024-07-05', resolvedAt: '2024-07-05', recordedBy: 'Staff001', notes: 'Batteries replaced', tenantId: 'T004', roomNumber: 'R104' },
  { reportId: 'MR020', type: 'complaint', title: 'Closet door off track', status: 'resolved', submittedAt: '2024-07-18', resolvedAt: '2024-07-19', recordedBy: 'Staff002', notes: 'Door realigned', tenantId: 'T005', roomNumber: 'R105' },
  { reportId: 'MR021', type: 'maintenance', title: 'Annual AC maintenance', status: 'resolved', submittedAt: '2024-08-10', resolvedAt: '2024-08-11', recordedBy: 'Staff001', notes: 'All AC units serviced', tenantId: 'T007', roomNumber: 'R106' },
  { reportId: 'MR022', type: 'complaint', title: 'Cabinet hinge broken', status: 'resolved', submittedAt: '2024-08-22', resolvedAt: '2024-08-23', recordedBy: 'Staff002', notes: 'Hinge replaced', tenantId: 'T008', roomNumber: 'R107' },
  { reportId: 'MR023', type: 'other', title: 'Window screen torn', status: 'resolved', submittedAt: '2024-09-05', resolvedAt: '2024-09-06', recordedBy: 'Staff001', notes: 'Screen replaced', tenantId: 'T009', roomNumber: 'R108' },
  { reportId: 'MR024', type: 'maintenance', title: 'Carpet cleaning needed', status: 'resolved', submittedAt: '2024-09-20', resolvedAt: '2024-09-21', recordedBy: 'Staff002', notes: 'Professional cleaning done', tenantId: 'T010', roomNumber: 'R109' },
  { reportId: 'MR025', type: 'complaint', title: 'Thermostat not working', status: 'resolved', submittedAt: '2024-10-08', resolvedAt: '2024-10-09', recordedBy: 'Staff003', notes: 'Thermostat replaced', tenantId: 'T011', roomNumber: 'R110' },
  { reportId: 'MR026', type: 'maintenance', title: 'Light bulb replacement', status: 'resolved', submittedAt: '2024-10-15', resolvedAt: '2024-10-15', recordedBy: 'Staff001', notes: 'All bulbs replaced with LED', tenantId: 'T001', roomNumber: 'R101' },
  { reportId: 'MR027', type: 'other', title: 'Bathroom faucet leak', status: 'resolved', submittedAt: '2024-11-03', resolvedAt: '2024-11-04', recordedBy: 'Staff001', notes: 'Faucet washer replaced', tenantId: 'T002', roomNumber: 'R102' },
  { reportId: 'MR028', type: 'complaint', title: 'Heating too hot', status: 'resolved', submittedAt: '2024-11-12', resolvedAt: '2024-11-13', recordedBy: 'Staff002', notes: 'Temperature adjusted', tenantId: 'T006', roomNumber: 'R103' },
  { reportId: 'MR029', type: 'maintenance', title: 'Fire extinguisher inspection', status: 'resolved', submittedAt: '2024-11-20', resolvedAt: '2024-11-20', recordedBy: 'Staff003', notes: 'All extinguishers checked', tenantId: 'T004', roomNumber: 'R104' },
  { reportId: 'MR030', type: 'complaint', title: 'Refrigerator noise', status: 'resolved', submittedAt: '2024-12-05', resolvedAt: '2024-12-06', recordedBy: 'Staff001', notes: 'Compressor serviced', tenantId: 'T005', roomNumber: 'R105' },
  
  // 2025 Reports
  { reportId: 'MR031', type: 'maintenance', title: 'New Year deep cleaning', status: 'resolved', submittedAt: '2025-01-03', resolvedAt: '2025-01-04', recordedBy: 'Staff002', notes: 'Complete cleaning done', tenantId: 'T007', roomNumber: 'R106' },
  { reportId: 'MR032', type: 'complaint', title: 'Internet outage', status: 'resolved', submittedAt: '2025-01-15', resolvedAt: '2025-01-16', recordedBy: 'Staff003', notes: 'Service provider fixed', tenantId: 'T008', roomNumber: 'R107' },
  { reportId: 'MR033', type: 'other', title: 'Blinds replacement', status: 'resolved', submittedAt: '2025-02-10', resolvedAt: '2025-02-11', recordedBy: 'Staff001', notes: 'New blinds installed', tenantId: 'T009', roomNumber: 'R108' },
  { reportId: 'MR034', type: 'maintenance', title: 'Smoke detector check', status: 'resolved', submittedAt: '2025-02-20', resolvedAt: '2025-02-20', recordedBy: 'Staff001', notes: 'All working properly', tenantId: 'T010', roomNumber: 'R109' },
  { reportId: 'MR035', type: 'complaint', title: 'Washing machine not draining', status: 'resolved', submittedAt: '2025-03-08', resolvedAt: '2025-03-09', recordedBy: 'Staff002', notes: 'Pump cleared', tenantId: 'T011', roomNumber: 'R110' },
  { reportId: 'MR036', type: 'maintenance', title: 'Spring maintenance check', status: 'resolved', submittedAt: '2025-03-22', resolvedAt: '2025-03-23', recordedBy: 'Staff001', notes: 'All systems checked', tenantId: 'T001', roomNumber: 'R101' },
  { reportId: 'MR037', type: 'complaint', title: 'Door squeaking', status: 'resolved', submittedAt: '2025-04-05', resolvedAt: '2025-04-05', recordedBy: 'Staff002', notes: 'Hinges lubricated', tenantId: 'T002', roomNumber: 'R102' },
  { reportId: 'MR038', type: 'other', title: 'Air filter replacement', status: 'resolved', submittedAt: '2025-04-18', resolvedAt: '2025-04-18', recordedBy: 'Staff001', notes: 'New filters installed', tenantId: 'T006', roomNumber: 'R103' },
  { reportId: 'MR039', type: 'maintenance', title: 'Pest control treatment', status: 'resolved', submittedAt: '2025-05-10', resolvedAt: '2025-05-10', recordedBy: 'Staff003', notes: 'Quarterly treatment done', tenantId: 'T004', roomNumber: 'R104' },
  { reportId: 'MR040', type: 'complaint', title: 'Water heater issue', status: 'resolved', submittedAt: '2025-05-25', resolvedAt: '2025-05-26', recordedBy: 'Staff001', notes: 'Thermostat adjusted', tenantId: 'T005', roomNumber: 'R105' },
  { reportId: 'MR041', type: 'maintenance', title: 'Gutter cleaning', status: 'resolved', submittedAt: '2025-06-08', resolvedAt: '2025-06-08', recordedBy: 'Staff002', notes: 'All gutters cleared', tenantId: 'T007', roomNumber: 'R106' },
  { reportId: 'MR042', type: 'other', title: 'Lock upgrade request', status: 'resolved', submittedAt: '2025-06-20', resolvedAt: '2025-06-21', recordedBy: 'Staff003', notes: 'Smart lock installed', tenantId: 'T008', roomNumber: 'R107' },
  { reportId: 'MR043', type: 'complaint', title: 'AC not cooling well', status: 'resolved', submittedAt: '2025-07-12', resolvedAt: '2025-07-13', recordedBy: 'Staff001', notes: 'Refrigerant recharged', tenantId: 'T009', roomNumber: 'R108' },
  { reportId: 'MR044', type: 'maintenance', title: 'Summer AC maintenance', status: 'resolved', submittedAt: '2025-07-28', resolvedAt: '2025-07-29', recordedBy: 'Staff001', notes: 'All AC units serviced', tenantId: 'T010', roomNumber: 'R109' },
  { reportId: 'MR045', type: 'complaint', title: 'Ceiling stain noticed', status: 'resolved', submittedAt: '2025-08-15', resolvedAt: '2025-08-16', recordedBy: 'Staff002', notes: 'Roof leak fixed and painted', tenantId: 'T011', roomNumber: 'R110' },
  { reportId: 'MR046', type: 'other', title: 'Window seal replacement', status: 'resolved', submittedAt: '2025-09-10', resolvedAt: '2025-09-11', recordedBy: 'Staff001', notes: 'Energy efficient seals installed', tenantId: 'T001', roomNumber: 'R101' },
  { reportId: 'MR047', type: 'maintenance', title: 'Fall maintenance inspection', status: 'resolved', submittedAt: '2025-09-25', resolvedAt: '2025-09-26', recordedBy: 'Staff003', notes: 'Complete inspection done', tenantId: 'T002', roomNumber: 'R102' },
  { reportId: 'MR048', type: 'complaint', title: 'Shower drain slow', status: 'resolved', submittedAt: '2025-10-08', resolvedAt: '2025-10-09', recordedBy: 'Staff001', notes: 'Drain cleaned professionally', tenantId: 'T006', roomNumber: 'R103' },
  { reportId: 'MR049', type: 'maintenance', title: 'Heating system check', status: 'pending', submittedAt: '2025-10-20', resolvedAt: null, recordedBy: 'Staff002', notes: 'Preparing for winter', tenantId: 'T004', roomNumber: 'R104' },
  { reportId: 'MR050', type: 'other', title: 'Storm window installation', status: 'pending', submittedAt: '2025-10-25', resolvedAt: null, recordedBy: 'Staff001', notes: 'Winter preparation', tenantId: 'T005', roomNumber: 'R105' }
];

// Announcement data - Various announcements from 2024-2025
const announcementRecords = [
  // 2024 Announcements
  { title: 'Welcome to Boardmate!', content: 'Welcome to our boarding house management system. We are excited to have you here. Please feel free to reach out if you have any questions.', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2024-01-15' },
  { title: 'Monthly Rent Reminder', content: 'This is a reminder that rent is due on the 1st of each month. Please ensure timely payment to avoid late fees. Thank you for your cooperation.', author: 'Admin', audience: 'tenants', priority: 'high', publishDate: '2024-01-25' },
  { title: 'Building Maintenance Schedule', content: 'We will be conducting routine building maintenance on February 10th from 9 AM to 5 PM. There may be temporary water and power interruptions. We apologize for any inconvenience.', author: 'Staff001', audience: 'all', priority: 'high', publishDate: '2024-02-05' },
  { title: 'WiFi Network Upgrade', content: 'Great news! We are upgrading our WiFi network to provide faster and more reliable internet connectivity. The upgrade will be completed by end of February. Network SSID remains the same.', author: 'Staff003', audience: 'all', priority: 'medium', publishDate: '2024-02-18' },
  { title: 'Fire Safety Drill', content: 'We will be conducting a mandatory fire safety drill on March 15th at 10 AM. All residents must participate. Please familiarize yourself with emergency exits and assembly points.', author: 'Admin', audience: 'all', priority: 'urgent', publishDate: '2024-03-08' },
  { title: 'Spring Cleaning Day', content: 'Join us for our annual Spring Cleaning Day on March 30th! We will be cleaning common areas and doing general maintenance. Volunteers are welcome and appreciated.', author: 'Staff002', audience: 'all', priority: 'low', publishDate: '2024-03-20' },
  { title: 'New Payment Methods Available', content: 'We now accept payments via digital wallet and online bank transfer! Check the payment portal for more details. Cash and check payments are still accepted.', author: 'Admin', audience: 'tenants', priority: 'medium', publishDate: '2024-04-05' },
  { title: 'AC Maintenance Schedule', content: 'With summer approaching, we will be servicing all AC units in May. Please report any issues with your AC unit so we can address them during scheduled maintenance.', author: 'Staff001', audience: 'all', priority: 'medium', publishDate: '2024-04-25' },
  { title: 'Parking Policy Update', content: 'Effective May 1st, all vehicles must display a valid parking permit. Guest parking is limited to designated areas. Please register your vehicle at the office.', author: 'Admin', audience: 'all', priority: 'high', publishDate: '2024-04-28' },
  { title: 'Community BBQ Event', content: 'Join us for a community BBQ on June 15th at 5 PM! Meet your neighbors, enjoy good food, and have fun. RSVP at the office by June 10th.', author: 'Staff002', audience: 'all', priority: 'low', publishDate: '2024-06-01' },
  { title: 'Water Conservation Notice', content: 'Due to summer heat, please help conserve water. Report any leaks immediately and follow water-saving tips posted in common areas. Thank you for your cooperation.', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2024-06-20' },
  { title: 'July 4th Holiday Hours', content: 'The office will be closed on July 4th for Independence Day. Emergency maintenance contact numbers are posted on the bulletin board. Have a safe holiday!', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2024-06-28' },
  { title: 'Pest Control Treatment', content: 'Quarterly pest control treatment will be conducted on July 20th. Please ensure your room is accessible and remove any food items from countertops.', author: 'Staff003', audience: 'all', priority: 'high', publishDate: '2024-07-15' },
  { title: 'Back to School Checklist', content: 'Students returning for the fall semester: Please update your emergency contact information, renew your parking permit, and confirm your lease details at the office.', author: 'Admin', audience: 'tenants', priority: 'medium', publishDate: '2024-08-01' },
  { title: 'Hurricane Preparedness', content: 'Hurricane season is here. Please review emergency procedures, stock up on essentials, and secure outdoor items. Report any property damage immediately.', author: 'Admin', audience: 'all', priority: 'urgent', publishDate: '2024-08-15' },
  { title: 'Labor Day Weekend Hours', content: 'Office hours during Labor Day weekend (Aug 31 - Sep 2): Limited hours. Emergency maintenance available 24/7. Enjoy the long weekend!', author: 'Admin', audience: 'all', priority: 'low', publishDate: '2024-08-28' },
  { title: 'Fall Maintenance Inspection', content: 'We will be conducting fall maintenance inspections from September 15-30. Staff will visit each unit to check HVAC, smoke detectors, and general condition. 24-hour notice will be given.', author: 'Staff001', audience: 'all', priority: 'high', publishDate: '2024-09-10' },
  { title: 'Rent Increase Notice', content: 'Please be informed that rent rates will increase by 3% starting January 2025. This is our first increase in 2 years. Updated lease terms will be sent by November 1st.', author: 'Admin', audience: 'tenants', priority: 'high', publishDate: '2024-10-01' },
  { title: 'Halloween Safety Tips', content: 'Happy Halloween! If you are celebrating, please be respectful of neighbors. Keep hallways clear, no pranks that cause damage, and report any suspicious activity.', author: 'Staff002', audience: 'all', priority: 'low', publishDate: '2024-10-25' },
  { title: 'Heating System Activation', content: 'Heating systems will be activated on November 1st. Please test your unit and report any issues. Keep vents unobstructed for efficient heating.', author: 'Staff001', audience: 'all', priority: 'high', publishDate: '2024-10-28' },
  { title: 'Thanksgiving Holiday Schedule', content: 'Office closed Nov 28-29 for Thanksgiving. Emergency maintenance available. Wishing everyone a wonderful holiday with family and friends!', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2024-11-20' },
  { title: 'Winter Weather Preparedness', content: 'Winter is coming! Tips: Keep heat at 55°F minimum when away, let faucets drip during freezing weather, and report frozen pipes immediately.', author: 'Admin', audience: 'all', priority: 'high', publishDate: '2024-11-25' },
  { title: 'Holiday Decorations Policy', content: 'Feel free to decorate for the holidays! Please follow fire safety guidelines: no open flames, check lights for damage, and don\'t block emergency exits. Happy holidays!', author: 'Staff002', audience: 'all', priority: 'medium', publishDate: '2024-12-01' },
  { title: 'End of Year Thank You', content: 'Thank you for being part of our community in 2024! We appreciate your cooperation and wish you a happy and prosperous New Year. See you in 2025!', author: 'Admin', audience: 'all', priority: 'low', publishDate: '2024-12-28' },
  
  // 2025 Announcements
  { title: 'Happy New Year 2025!', content: 'Welcome to 2025! We look forward to another great year. Reminder: January rent is due. Office reopens January 2nd with normal hours.', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2025-01-01' },
  { title: 'Rent Rate Updates Effective Today', content: 'As previously announced, new rent rates are effective January 1st. Please review your updated lease terms. Contact the office with any questions.', author: 'Admin', audience: 'tenants', priority: 'high', publishDate: '2025-01-01' },
  { title: 'Snow Removal Procedures', content: 'During snow events, parking lots and walkways will be cleared by 7 AM. Please move vehicles to designated areas when notified. Stay safe!', author: 'Staff001', audience: 'all', priority: 'high', publishDate: '2025-01-15' },
  { title: 'Maintenance Request App Update', content: 'We have updated our maintenance request system! You can now submit requests, upload photos, and track progress through the tenant portal. Check your email for login details.', author: 'Staff003', audience: 'tenants', priority: 'medium', publishDate: '2025-01-20' },
  { title: 'Valentine\'s Day Community Event', content: 'Join us for a Valentine\'s Day potluck on February 14th at 6 PM in the community room. Bring a dish to share and meet your neighbors!', author: 'Staff002', audience: 'all', priority: 'low', publishDate: '2025-02-05' },
  { title: 'Internet Service Upgrade Complete', content: 'Great news! Our internet speed has been upgraded to fiber optic. Enjoy faster downloads and streaming. Contact the office if you experience any issues.', author: 'Staff003', audience: 'all', priority: 'medium', publishDate: '2025-02-20' },
  { title: 'Spring Forward - Daylight Saving Time', content: 'Reminder: Daylight Saving Time begins March 9th. Set your clocks forward one hour. Also a good time to test smoke detectors!', author: 'Admin', audience: 'all', priority: 'low', publishDate: '2025-03-05' },
  { title: 'Annual Fire Safety Inspection', content: 'Fire marshal inspection scheduled for March 25th. All smoke detectors and fire extinguishers will be checked. No action needed from residents.', author: 'Staff001', audience: 'all', priority: 'medium', publishDate: '2025-03-15' },
  { title: 'Spring Cleaning & Maintenance', content: 'Spring maintenance begins April 1st! We will be power washing buildings, servicing AC units, and refreshing landscaping. Thank you for your patience.', author: 'Staff001', audience: 'all', priority: 'medium', publishDate: '2025-03-28' },
  { title: 'Earth Day Recycling Drive', content: 'Celebrate Earth Day with us on April 22nd! Drop off recyclables and old electronics at designated areas. Let\'s keep our community green!', author: 'Staff002', audience: 'all', priority: 'low', publishDate: '2025-04-15' },
  { title: 'Pool Opening Memorial Day Weekend', content: 'The community pool will open May 24th for summer! Pool rules and hours are posted. Please respect quiet hours and pool capacity limits.', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2025-05-10' },
  { title: 'Summer Lease Renewals', content: 'Lease renewal notices for leases expiring in 2025 are being sent this week. Please respond by June 15th to secure your renewal rate.', author: 'Admin', audience: 'tenants', priority: 'high', publishDate: '2025-05-20' },
  { title: 'Father\'s Day BBQ', content: 'Celebrate dads at our BBQ on June 15th at 4 PM! Burgers, hot dogs, and games. RSVP by June 10th at the office.', author: 'Staff002', audience: 'all', priority: 'low', publishDate: '2025-06-05' },
  { title: 'July 4th Celebration & Safety', content: 'Happy Independence Day! Office closed July 4th. Please be safe with fireworks - follow local laws. Enjoy the holiday!', author: 'Admin', audience: 'all', priority: 'medium', publishDate: '2025-06-30' },
  { title: 'Summer AC Tips', content: 'Beat the heat! Tips: Keep blinds closed during hot days, set AC to 76-78°F, and report any AC issues immediately. Stay cool!', author: 'Staff001', audience: 'all', priority: 'medium', publishDate: '2025-07-15' },
  { title: 'Back to School Info Session', content: 'Students: Join us August 15th for a back-to-school info session. Topics: parking, quiet hours, maintenance requests, and community guidelines.', author: 'Admin', audience: 'tenants', priority: 'medium', publishDate: '2025-08-05' },
  { title: 'Labor Day Weekend Schedule', content: 'Office closed Sep 1st for Labor Day. Emergency maintenance available. Pool closes for the season Sep 2nd. Thanks for a great summer!', author: 'Admin', audience: 'all', priority: 'low', publishDate: '2025-08-28' },
  { title: 'Fall Pest Control Treatment', content: 'Quarterly pest control on September 25th. Please ensure access to your unit and remove food from counters. Questions? Call the office.', author: 'Staff003', audience: 'all', priority: 'high', publishDate: '2025-09-15' },
  { title: 'Rent Payment Portal Upgrade', content: 'We have upgraded our rent payment portal with new features: auto-pay, payment history, receipt downloads, and more. Check your email for access.', author: 'Admin', audience: 'tenants', priority: 'medium', publishDate: '2025-09-28' },
  { title: 'Fall Maintenance Begins', content: 'Fall maintenance schedule: October 1-31. We will be checking heating systems, cleaning gutters, and preparing for winter. Thank you for your cooperation!', author: 'Staff001', audience: 'all', priority: 'medium', publishDate: '2025-10-01' },
  { title: 'Heating System Check - Action Required', content: 'Please test your heating system this week. Report any issues immediately so we can address them before cold weather arrives. Stay warm!', author: 'Staff001', audience: 'all', priority: 'high', publishDate: '2025-10-15' }
];

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Room.deleteMany({});
    await Tenant.deleteMany({});
    await Payment.deleteMany({});
    await Report.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    
    // Hash passwords before insertion
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds)
      }))
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`✓ Created ${createdUsers.length} users with encrypted passwords`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Seed rooms
const seedRooms = async (adminUser) => {
  try {
    const rooms = roomNumbers.map(room => {
      const config = roomConfigs[room.type];
      return {
        roomNumber: room.number,
        roomType: room.type,
        capacity: config.capacity,
        monthlyRent: config.monthlyRent,
        securityDeposit: config.securityDeposit,
        description: `${room.type.charAt(0).toUpperCase() + room.type.slice(1)} occupancy room`,
        amenities: ['WiFi', 'Air Conditioning', 'Furnished', 'Private Bathroom'],
        floor: parseInt(room.number.substring(2, 3)),
        area: config.capacity * 12, // Simple calculation
        status: 'available',
        occupancy: {
          current: 0,
          max: config.capacity
        },
        isActive: true,
        createdBy: adminUser._id,
        updatedBy: adminUser._id
      };
    });

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✓ Created ${createdRooms.length} rooms`);
    return createdRooms;
  } catch (error) {
    console.error('Error seeding rooms:', error);
    throw error;
  }
};

// Seed tenants
const seedTenants = async (rooms) => {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const roomMap = {};
    rooms.forEach(room => {
      roomMap[room.roomNumber] = room._id;
    });

    const tenantsData = tenantData.map(tenant => {
      const roomId = roomMap[tenant.room];
      const room = rooms.find(r => r.roomNumber === tenant.room);
      
      return {
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        password: 'Tenant@2024', // Will be hashed below
        phoneNumber: `+63${Math.floor(9000000000 + Math.random() * 1000000000)}`,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        occupation: ['Student', 'Professional', 'Freelancer', 'Employee'][Math.floor(Math.random() * 4)],
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000'
        },
        idType: 'national_id',
        idNumber: `NID-${Math.floor(100000000 + Math.random() * 900000000)}`,
        emergencyContact: {
          name: `Emergency Contact ${tenant.firstName}`,
          relationship: 'Parent',
          phoneNumber: `+63${Math.floor(9000000000 + Math.random() * 1000000000)}`
        },
        room: roomId,
        leaseStartDate: new Date('2024-01-01'),
        leaseEndDate: new Date('2025-12-31'), // Extended to end of 2025
        monthlyRent: room.monthlyRent,
        securityDeposit: room.securityDeposit,
        tenantStatus: 'active',
        isVerified: true
      };
    });

    // Hash passwords before insertion
    const tenantsWithHashedPasswords = await Promise.all(
      tenantsData.map(async (tenant) => ({
        ...tenant,
        password: await bcrypt.hash(tenant.password, saltRounds)
      }))
    );

    const createdTenants = await Tenant.insertMany(tenantsWithHashedPasswords);
    
    // Update rooms with tenant references
    const tenantIdMap = {};
    createdTenants.forEach((tenant, index) => {
      tenantIdMap[tenantData[index].id] = tenant._id;
    });

    // Group tenants by room
    const roomTenantMap = {};
    createdTenants.forEach(tenant => {
      const roomId = tenant.room.toString();
      if (!roomTenantMap[roomId]) {
        roomTenantMap[roomId] = [];
      }
      roomTenantMap[roomId].push(tenant._id);
    });

    // Update each room with its tenants
    for (const [roomId, tenantIds] of Object.entries(roomTenantMap)) {
      await Room.findByIdAndUpdate(roomId, {
        tenants: tenantIds,
        'occupancy.current': tenantIds.length,
        status: 'occupied'
      });
    }

    console.log(`✓ Created ${createdTenants.length} tenants with encrypted passwords and updated room assignments`);
    return { createdTenants, tenantIdMap };
  } catch (error) {
    console.error('Error seeding tenants:', error);
    throw error;
  }
};

// Seed payments
const seedPayments = async (tenantIdMap, rooms, users) => {
  try {
    const roomMap = {};
    rooms.forEach(room => {
      roomMap[room.roomNumber] = room._id;
    });

    const staffUser = users.find(u => u.name === 'Staff001');

    const payments = paymentRecords.map(payment => {
      const tenantId = tenantIdMap[payment.tenantId];
      const roomId = roomMap[payment.roomNumber];
      const paymentDate = new Date(payment.date);
      const dueDate = new Date(payment.dueDate);

      return {
        tenant: tenantId,
        room: roomId,
        amount: payment.amount,
        paymentType: payment.type,
        paymentMethod: payment.method,
        paymentDate: paymentDate,
        dueDate: dueDate,
        status: payment.status,
        periodCovered: {
          startDate: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1),
          endDate: new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0)
        },
        receiptNumber: payment.status === 'paid' ? `RCP-${paymentDate.getFullYear()}${String(paymentDate.getMonth() + 1).padStart(2, '0')}${String(paymentDate.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        description: `Monthly rent for ${new Date(dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        recordedBy: staffUser._id,
        lateFee: {
          amount: payment.daysLate > 0 ? payment.daysLate * 50 : 0,
          reason: payment.daysLate > 0 ? `Payment delayed by ${payment.daysLate} days` : '',
          isLatePayment: payment.daysLate > 0
        }
      };
    });

    const createdPayments = await Payment.insertMany(payments);
    console.log(`✓ Created ${createdPayments.length} payment records`);
    return createdPayments;
  } catch (error) {
    console.error('Error seeding payments:', error);
    throw error;
  }
};

// Seed reports
const seedReports = async (tenantIdMap, rooms) => {
  try {
    const roomMap = {};
    rooms.forEach(room => {
      roomMap[room.roomNumber] = room._id;
    });

    const reports = reportRecords.map(report => {
      const tenantId = tenantIdMap[report.tenantId];
      const roomId = roomMap[report.roomNumber];
      const submittedAt = new Date(report.submittedAt);
      const resolvedAt = report.resolvedAt ? new Date(report.resolvedAt) : null;

      return {
        tenant: tenantId,
        room: roomId,
        type: report.type,
        title: report.title,
        description: report.notes || report.title,
        status: report.status,
        submittedAt: submittedAt,
        followUp: report.status === 'pending',
        followUpDate: report.status === 'pending' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        isArchived: false
      };
    });

    const createdReports = await Report.insertMany(reports);
    console.log(`✓ Created ${createdReports.length} report records`);
    return createdReports;
  } catch (error) {
    console.error('Error seeding reports:', error);
    throw error;
  }
};

// Seed announcements
const seedAnnouncements = async (users, tenants) => {
  try {
    // Create a map of author roles to user IDs
    const adminUser = users.find(u => u.role === 'admin');
    const staff001 = users.find(u => u.email === 'staff001@boardmate.com');
    const staff002 = users.find(u => u.email === 'staff002@boardmate.com');
    const staff003 = users.find(u => u.email === 'staff003@boardmate.com');

    const authorMap = {
      'Admin': adminUser._id,
      'Staff001': staff001._id,
      'Staff002': staff002._id,
      'Staff003': staff003._id
    };

    const announcements = announcementRecords.map(announcement => {
      const publishDate = new Date(announcement.publishDate);
      
      return {
        title: announcement.title,
        content: announcement.content,
        author: authorMap[announcement.author],
        audience: announcement.audience,
        priority: announcement.priority,
        publishDate: publishDate,
        isArchived: false,
        readBy: [] // Start with no readers
      };
    });

    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log(`✓ Created ${createdAnnouncements.length} announcement records`);
    return createdAnnouncements;
  } catch (error) {
    console.error('Error seeding announcements:', error);
    throw error;
  }
};

// Main seeder function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...\n');

    await connectDB();
    await clearData();

    console.log('\nSeeding data...');
    const users = await seedUsers();
    const adminUser = users.find(u => u.role === 'admin');
    const rooms = await seedRooms(adminUser);
    const { createdTenants, tenantIdMap } = await seedTenants(rooms);
    await seedPayments(tenantIdMap, rooms, users);
    await seedReports(tenantIdMap, rooms);
    await seedAnnouncements(users, createdTenants);

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nDefault credentials:');
    console.log('Admin: admin@boardmate.com / Admin@2024');
    console.log('Staff001: staff001@boardmate.com / Staff001@2024');
    console.log('Staff002: staff002@boardmate.com / Staff002@2024');
    console.log('Staff003: staff003@boardmate.com / Staff003@2024');
    console.log('Tenants: {email} / Tenant@2024');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
