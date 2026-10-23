import React from 'react';

export const MOOD_OPTIONS = [
  { value: 'Very Low', label: 'Very Low', emoji: '🌧️', bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Low', label: 'Low', emoji: '⛅', bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Okay', label: 'Okay', emoji: '🌱', bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Good', label: 'Good', emoji: '🌿', bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Great', label: 'Great', emoji: '☀️', bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
];

export const MoodSelector = ({ selectedMood, onSelect, className = '', disabled = false }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 sm:gap-2.5 ${className}`}>
      {MOOD_OPTIONS.map((item) => {
        const isSelected = selectedMood === item.value;
        return (
          <button
            key={item.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item.value)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
              isSelected
                ? 'bg-[#DCE5D5] border-[#294A40] text-[#294A40] shadow-sm font-semibold'
                : 'bg-[#FBFAF6] border-[#E5E8DF] text-[#293B38] hover:bg-[#E9EDE2] hover:border-[#DCE5D5]'
            }`}
          >
            <span className="text-sm">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
