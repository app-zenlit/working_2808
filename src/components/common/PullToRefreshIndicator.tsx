import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  isRefreshing: boolean;
  pullDistance: number;
  isPulling: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator: React.FC<Props> = ({
  isRefreshing,
  pullDistance,
  isPulling,
  threshold = 80
}) => {
  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShow = isPulling || isRefreshing;
  
  if (!shouldShow) return null;

  return (
    <div 
      className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-200"
      style={{
        height: Math.max(pullDistance, isRefreshing ? 60 : 0),
        transform: `translateY(${isRefreshing ? 0 : -20}px)`,
        opacity: isRefreshing ? 1 : progress
      }}
    >
      <div className="flex items-center gap-2 text-white">
        <ArrowPathIcon 
          className={`w-5 h-5 transition-transform duration-200 ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: `rotate(${progress * 180}deg)`
          }}
        />
        <span className="text-sm font-medium">
          {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  );
};