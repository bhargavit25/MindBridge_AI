import React from 'react';

export const Card = ({
  children,
  variant = 'default', // 'default' (soft ivory), 'sage', 'peach', 'outline'
  className = '',
  onClick,
  hover = false,
  ...props
}) => {
  const baseStyles = "rounded-2xl sm:rounded-3xl transition-all duration-200";

  const variantStyles = {
    default: "bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)]",
    sage: "bg-[#E9EDE2] border border-[#DCE5D5]",
    softSage: "bg-[#DCE5D5]/40 border border-[#DCE5D5]",
    peach: "bg-[#FBF4EE] border border-[#F3D8C8]",
    lavender: "bg-[#F4F1F9] border border-[#E9E5F2]",
    white: "bg-white border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.03)]",
    outline: "bg-transparent border border-[#E5E8DF]",
  };

  const hoverStyles = hover ? "hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(41,59,56,0.06)] hover:border-[#DCE5D5] cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
