import React from 'react';

const NotificationsSummaryCard: React.FC<{ title: string; value: React.ReactNode; className?: string }> = ({ title, value, className }) => {
  return (
    <div className={`p-4 rounded-lg shadow-sm bg-white ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500 text-center sm:text-left">{title}</div>
        <div className="mt-2 sm:mt-0 text-2xl font-semibold text-center sm:text-right">{value}</div>
      </div>
    </div>
  );
};

export default NotificationsSummaryCard;
