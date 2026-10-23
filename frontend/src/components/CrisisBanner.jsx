import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X } from 'lucide-react';

export const CrisisBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Crisis Support Banner"
      className="bg-[#FBF4EE] border-b border-[#F3D8C8] text-[#293B38] text-xs py-2 px-4 relative z-50 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-[11px] bg-[#F3D8C8] text-[#294A40] px-2 py-0.5 rounded-full">
            <ShieldAlert className="w-3 h-3 text-[#294A40]" /> Immediate Support
          </span>
          <span className="text-[#78817D] hidden md:inline">
            If you or someone you know is in distress or needs urgent care:
          </span>
          <span className="font-medium text-[#293B38] flex items-center gap-1.5 flex-wrap">
            <PhoneCall className="w-3.5 h-3.5 text-[#294A40]" />
            <span>Tele-MANAS: <a href="tel:14416" className="font-bold underline text-[#294A40] hover:text-[#1F3831]">14416</a></span>
            <span className="text-[#969D97]">•</span>
            <span>Lifeline: <a href="tel:988" className="font-bold underline text-[#294A40] hover:text-[#1F3831]">988</a></span>
            <span className="text-[11px] text-[#78817D]">(24/7, Free & Confidential)</span>
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-[#F3D8C8]/60 rounded-full transition-colors text-[#78817D] hover:text-[#293B38]"
          title="Dismiss notice"
          aria-label="Dismiss crisis notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

