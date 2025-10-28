import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  description?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading... please wait.',
  description,
}) => {
  return (
  <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-2xl border border-sky-100 bg-white/80 p-10 text-center shadow-sm">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-sky-100"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full bg-sky-100/40"></div>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-sky-700">{message}</p>
        {description && (
          <p className="text-sm text-sky-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
