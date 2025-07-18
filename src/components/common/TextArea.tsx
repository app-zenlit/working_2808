import React from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  showCharCount?: boolean;
}

export const TextArea: React.FC<Props> = ({ 
  error = false,
  showCharCount = false,
  maxLength,
  value,
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none';
  const errorClasses = error ? 'border-red-500' : 'border-gray-600';

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      <textarea
        className={`${baseClasses} ${errorClasses} ${className}`}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      {showCharCount && maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${currentLength > maxLength * 0.9 ? 'text-red-400' : 'text-gray-400'}`}>
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};