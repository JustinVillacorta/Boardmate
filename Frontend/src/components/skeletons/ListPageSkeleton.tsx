import React from "react";
import { SkeletonLine } from "../ui/Skeleton";

interface ListPageSkeletonProps {
  cardsPerRow?: 1 | 2 | 3 | 4;
  rows?: number;
}

const ListPageSkeleton: React.FC<ListPageSkeletonProps> = ({ cardsPerRow = 3, rows = 2 }) => {
  const total = cardsPerRow * rows;
  const gridCols = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }[cardsPerRow];
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4 lg:gap-6`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <SkeletonLine className="h-5 w-1/2" />
          <SkeletonLine className="h-4 w-full" />
          <SkeletonLine className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
};

export default ListPageSkeleton;


