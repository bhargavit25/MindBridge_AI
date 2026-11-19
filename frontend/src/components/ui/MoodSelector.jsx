import React from 'react';

export const MOOD_OPTIONS = [
  { value: 'Very Happy', label: 'Very Happy', emoji: '😄', rating: 7, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Happy', label: 'Happy', emoji: '🙂', rating: 6, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Neutral', label: 'Neutral', emoji: '😐', rating: 5, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Anxious', label: 'Anxious', emoji: '😰', rating: 4, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Stressed', label: 'Stressed', emoji: '😫', rating: 3, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Sad', label: 'Sad', emoji: '😢', rating: 2, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
  { value: 'Very Sad', label: 'Very Sad', emoji: '😭', rating: 1, bg: 'hover:bg-[#E9EDE2]', selectedBg: 'bg-[#DCE5D5] border-[#294A40] text-[#294A40]' },
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
