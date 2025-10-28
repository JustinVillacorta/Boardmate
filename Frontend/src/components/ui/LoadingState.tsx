import React from 'react';
import { SkeletonCard, SkeletonLine } from './Skeleton';

interface LoadingStateProps {
  message?: string;
  description?: string;
  children?: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading... please wait.',
  description,
  children,
}) => {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">
      {/* Optional header copy */}
      {(message || description) && (
        <div className="mb-4">
          {message && <p className="text-sm font-medium text-gray-700">{message}</p>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      {/* Render provided skeletons or a generic fallback */}
      {children ? (
        <>{children}</>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <SkeletonCard className="p-4 space-y-3">
            <SkeletonLine className="h-6 w-1/3" />
            <SkeletonLine className="h-4 w-2/3" />
            <SkeletonLine className="h-4 w-1/2" />
          </SkeletonCard>
          <SkeletonCard className="p-4 space-y-3">
            <SkeletonLine className="h-6 w-1/3" />
            <SkeletonLine className="h-4 w-2/3" />
            <SkeletonLine className="h-4 w-1/2" />
          </SkeletonCard>
          <SkeletonCard className="p-4 space-y-3">
            <SkeletonLine className="h-6 w-1/3" />
            <SkeletonLine className="h-4 w-2/3" />
            <SkeletonLine className="h-4 w-1/2" />
          </SkeletonCard>
          <SkeletonCard className="lg:col-span-3 p-4 space-y-4">
            <SkeletonLine className="h-5 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonLine key={i} className="h-24 w-full" />
              ))}
            </div>
          </SkeletonCard>
        </div>
      )}
    </div>
  );
};

export default LoadingState;
