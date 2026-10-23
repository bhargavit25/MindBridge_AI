import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-[#293B38]">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-4 py-2.5 text-sm rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40] focus:ring-1 focus:ring-[#294A40]/20 transition-all duration-200 ${
          error ? 'border-rose-400 bg-rose-50/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-[#78817D]">{helperText}</p>}
    </div>
  );
};
