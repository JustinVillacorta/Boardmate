import React from 'react';
import { House, Users, PhilippinePeso, Wrench, Dot } from "lucide-react";

interface MetricCardsProps {
  data: {
    occupancy?: {
      totalRooms: number;
      occupiedRooms: number;
      availableRooms: number;
    };
    stats?: {
      tenants?: {
        total: number;
        active: number;
      };
    };
    payments?: {
      thisMonth?: {
        amount: number;
        count: number;
      };
      byStatus?: {
        paid?: {
          count: number;
        };
      };
    };
    reports?: {
      total: number;
      byStatus?: {
        pending: number;
      };
    };
  };
}

const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Total Rooms',
      value: data.occupancy?.totalRooms || 0,
      subtitle: `${data.occupancy?.occupiedRooms || 0} Occupied • ${data.occupancy?.availableRooms || 0} Available`,
      icon: House,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Tenants',
      value: data.stats?.tenants?.total || 0,
      subtitle: `${data.stats?.tenants?.active || 0} Active Tenancies`,
      icon: Users,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₱${(data.payments?.thisMonth?.amount || 0).toLocaleString()}`,
      subtitle: `${data.payments?.byStatus?.paid?.count || 0} of ${data.payments?.thisMonth?.count || 0} Collected`,
      icon: PhilippinePeso,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Maintenance Requests',
      value: data.reports?.total || 0,
      subtitle: `${data.reports?.byStatus?.pending || 0} Pending`,
      icon: Wrench,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow flex flex-col h-44 lg:h-52"
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 lg:w-14 lg:h-14 ${metric.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <metric.icon className={`w-6 h-6 lg:w-7 lg:h-7 ${metric.iconColor}`} />
            </div>
            <p className="text-sm lg:text-base font-medium text-gray-500">{metric.title}</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p
              className="text-2xl lg:text-3xl font-bold text-gray-900 text-center"
              style={{ wordBreak: 'break-word', lineHeight: 1.2 }}
            >
              {metric.value}
            </p>
          </div>
          <div className="flex items-center justify-center text-xs lg:text-sm pt-2">
            <Dot className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-700 ml-1 text-center">{metric.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;