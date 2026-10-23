import React from 'react';

export const ProgressBar = ({ current, total, className = '' }) => {
  const percentage = Math.min(Math.max(Math.round((current / total) * 100), 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center text-xs text-[#78817D] mb-1.5 font-medium">
        <span>Question {current} of {total}</span>
        <span>{percentage}% complete</span>
      </div>
      <div className="w-full h-1.5 bg-[#E9EDE2] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#294A40] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
