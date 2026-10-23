import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' (deep forest), 'secondary' (soft sage), 'outline', 'ghost', 'peach'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-deep/20 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-[#294A40] text-[#FBFAF6] hover:bg-[#1F3831] shadow-sm active:scale-[0.99]",
    secondary: "bg-[#E9EDE2] text-[#293B38] hover:bg-[#DCE5D5] active:scale-[0.99]",
    outline: "border border-[#E5E8DF] bg-transparent text-[#293B38] hover:bg-[#FBFAF6] hover:border-[#DCE5D5] active:scale-[0.99]",
    ghost: "bg-transparent text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]/60",
    peach: "bg-[#F3D8C8] text-[#293B38] hover:bg-[#ebd0bf] shadow-sm active:scale-[0.99]",
    ivory: "bg-[#FBFAF6] text-[#293B38] border border-[#E5E8DF] hover:bg-[#E9EDE2]/50 shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4"} />}
      {children}
    </button>
  );
};
