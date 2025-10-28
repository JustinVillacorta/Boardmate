import React from "react";

type BaseProps = {
  className?: string;
};

export const Skeleton: React.FC<BaseProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
  );
};

export const SkeletonLine: React.FC<BaseProps & { widthClass?: string; heightClass?: string }> = ({
  className = "",
  widthClass = "w-full",
  heightClass = "h-4",
}) => {
  return <Skeleton className={`${widthClass} ${heightClass} ${className}`} />;
};

export const SkeletonCircle: React.FC<BaseProps & { sizeClass?: string }> = ({
  className = "",
  sizeClass = "h-10 w-10",
}) => {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${sizeClass} ${className}`} />;
};

export const SkeletonAvatar: React.FC<BaseProps & { sizeClass?: string }> = ({
  className = "",
  sizeClass = "h-12 w-12",
}) => {
  return <SkeletonCircle className={className} sizeClass={sizeClass} />;
};

export const SkeletonCard: React.FC<React.PropsWithChildren<BaseProps>> = ({ className = "", children }) => {
  return <div className={`animate-pulse rounded-xl border border-gray-200 bg-white ${className}`}>{children}</div>;
};

export default Skeleton;


