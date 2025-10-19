import React from 'react';

type Props = {
  title: string;
  value: number;
  icon?: React.ReactNode;
  iconBgClass?: string; // tailwind bg class for the icon circle
  iconColorClass?: string; // tailwind text color for the icon itself
};

const SummaryCard: React.FC<Props> = ({ title, value, icon, iconBgClass = 'bg-white', iconColorClass = 'text-gray-500' }) => (
  <div className="p-4 rounded-lg shadow-sm bg-white">
    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
      <div className="text-center sm:text-left">
        <div className="text-xs text-gray-500">{title}</div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </div>

      <div className={`w-14 h-14 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${iconBgClass}`}>
        <div className={`${iconColorClass}`}>{icon}</div>
      </div>
    </div>
  </div>
);

export default SummaryCard;
