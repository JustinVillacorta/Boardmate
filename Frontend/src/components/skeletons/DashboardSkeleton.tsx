import React from "react";
import { SkeletonLine } from "../ui/Skeleton";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <SkeletonLine className="h-4 w-1/3" />
            <SkeletonLine className="h-8 w-1/2" />
            <SkeletonLine className="h-3 w-2/3" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <SkeletonLine className="h-5 w-1/4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLine key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <SkeletonLine className="h-5 w-1/4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLine key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;


