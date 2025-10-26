import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartsProps {
  data: {
    occupancy?: {
      occupiedRooms: number;
      availableRooms: number;
      maintenanceRooms: number;
      occupancyRate: number;
    };
    payments?: {
      monthlyTrends?: Array<{
        month: string;
        collected: number;
        overdue: number;
        amount: number;
      }>;
    };
  };
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
  // Prepare chart data for occupancy
  const workLogData = data.occupancy ? [
    { name: "Occupied", value: data.occupancy.occupiedRooms, color: "#899effff" },
    { name: "Available", value: data.occupancy.availableRooms, color: "#10b981" },
    { name: "Maintenance", value: data.occupancy.maintenanceRooms, color: "#ff7575ff" }
  ].filter(item => item.value > 0) : [];

  // Ensure donut is visible even when all values are zero
  const totalOccupancy = (data.occupancy?.occupiedRooms || 0) + (data.occupancy?.availableRooms || 0) + (data.occupancy?.maintenanceRooms || 0);
  const pieDataForRender = totalOccupancy > 0 ? workLogData : [{ name: "No Data", value: 1, color: "#e5e7eb" }];

  const trendData = data.payments?.monthlyTrends || [];
  // Calculate totals across all months
  const totalCollected = trendData.reduce((sum, month) => sum + (month.collected || 0), 0);
  const totalOverdue = trendData.reduce((sum, month) => sum + (month.overdue || 0), 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      {/* Occupancy Rate Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 min-h-[400px]">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Occupancy Rate</h2>
        </div>

        {/* Responsive container for Pie Chart + Legend */}
        <div className="flex flex-col lg:flex-row items-center justify-center h-full">
          {/* Pie Chart - enlarged to fill column (fixed height for ResponsiveContainer) */}
          <div className="w-full lg:w-1/2 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDataForRender}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label
                >
                  {pieDataForRender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="lg:ml-6 space-y-2 lg:space-y-3">
            {workLogData.map((item, index) => (
              <div key={index} className="flex items-center justify-between w-full lg:w-32">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs lg:text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs lg:text-sm font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Trends Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-2 lg:mb-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Monthly Payment Trends</h2>
          <span className="text-sm text-gray-600">{data.occupancy?.occupancyRate || 0}%</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Payment collection performance over time</p>

        {/* Line Chart */}
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }} 
                stroke="#6B7280" 
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                stroke="#6B7280" 
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", r: 2 }}
                name="Total Amount"
              />
              <Line
                type="monotone"
                dataKey="overdue"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", r: 2 }}
                name="Overdue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 lg:gap-6 mt-4 lg:mt-6">
          <div className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-600 font-semibold text-sm lg:text-base">₱ {totalCollected.toLocaleString()}</p>
            <p className="text-xs lg:text-sm text-gray-600">Total Collected</p>
          </div>
          <div className="px-4 lg:px-6 py-2 lg:py-3 bg-red-50 rounded-lg text-center">
            <p className="text-red-600 font-semibold text-sm lg:text-base">₱ {totalOverdue.toLocaleString()}</p>
            <p className="text-xs lg:text-sm text-gray-600">Total Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;