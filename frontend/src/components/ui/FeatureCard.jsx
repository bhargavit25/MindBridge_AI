import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const FeatureCard = ({
  to,
  title,
  description,
  icon: Icon,
  badge,
  className = '',
}) => {
  return (
    <Link
      to={to}
      className={`group relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] hover:border-[#DCE5D5] hover:shadow-[0_4px_16px_rgba(41,59,56,0.05)] transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center transition-colors group-hover:bg-[#DCE5D5]">
            {Icon && <Icon className="w-5 h-5 text-[#294A40]" />}
          </div>
          {badge ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40]">
              {badge}
            </span>
          ) : (
            <div className="w-7 h-7 rounded-full bg-transparent text-[#969D97] group-hover:text-[#294A40] group-hover:bg-[#E9EDE2]/50 flex items-center justify-center transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          )}
        </div>
        <h3 className="font-semibold text-base text-[#293B38] mb-1.5 tracking-tight group-hover:text-[#294A40]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};
