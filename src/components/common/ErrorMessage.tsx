import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  message: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ErrorMessage: React.FC<Props> = ({ 
  message, 
  type = 'error',
  className = '' 
}) => {
  const typeStyles = {
    error: 'bg-red-900/30 border-red-700 text-red-400',
    warning: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
    info: 'bg-blue-900/30 border-blue-700 text-blue-400',
  };

  return (
    <div className={`border rounded-lg p-3 ${typeStyles[type]} ${className}`}>
      <div className="flex items-start gap-2">
        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};