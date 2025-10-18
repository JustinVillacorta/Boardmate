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

  const SAMPLE_PAYMENTS = [
    { month: "Jan", collected: 13500, overdue: 500, amount: 14000 },
    { month: "Feb", collected: 13200, overdue: 700, amount: 13900 },
    { month: "Mar", collected: 13800, overdue: 600, amount: 14400 },
    { month: "Apr", collected: 13000, overdue: 900, amount: 13900 },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
      {/* Occupancy Rate Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Occupancy Rate</h2>
        </div>

        {/* Responsive container for Pie Chart + Legend */}
        <div className="flex flex-col lg:flex-row items-center justify-center">
          {/* Pie Chart */}
          <div className="h-48 w-48 lg:h-64 lg:w-64 mb-4 lg:mb-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workLogData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {workLogData.map((entry, index) => (
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
            <LineChart data={data.payments?.monthlyTrends || SAMPLE_PAYMENTS}>
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
            <p className="text-blue-600 font-semibold text-sm lg:text-base">₱ 12,505</p>
            <p className="text-xs lg:text-sm text-gray-600">Collected</p>
          </div>
          <div className="px-4 lg:px-6 py-2 lg:py-3 bg-red-50 rounded-lg text-center">
            <p className="text-red-600 font-semibold text-sm lg:text-base">₱ 945</p>
            <p className="text-xs lg:text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;