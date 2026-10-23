import React from 'react';
import { Shield, Lock, EyeOff, Database } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 font-sans text-[#293B38]">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#294A40] bg-[#E9EDE2] px-3 py-1 rounded-full border border-[#DCE5D5]">
          Confidentiality Charter
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold text-[#293B38] tracking-tight">
          Privacy by Design
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
          How MindBridge AI protects your personal reflections, journals, and private data.
        </p>
      </div>

      <div className="bg-[#FBFAF6] p-8 sm:p-10 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-7">
        
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#293B38] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#294A40]" />
            <span>1. Complete Isolation of Personal Journal Entries</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
            Your private journal reflections are encrypted and strictly accessible only through your authenticated login. Campus administrators and instructors have no mechanisms or access permissions to view individual entries.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#293B38] flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#294A40]" />
            <span>2. Private AI Conversations</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
            MindBridge Assistant runs on local models and localized vector databases. Your chats are never sold, rented, or fed into third-party generative models for advertising. You retain full control to delete chat sessions whenever you wish.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#293B38] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#294A40]" />
            <span>3. Non-Punitive & Non-Evaluative Policy</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
            Wellness screenings (PHQ-9 and GAD-7) and mood check-ins are strictly self-care metrics. They cannot be used for academic grading, scholarship reviews, attendance assessments, or institutional disciplinary proceedings.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#293B38] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#294A40]" />
            <span>4. Anonymized Aggregation</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
            Institutional dashboards show only high-level campus-wide counts with minimum group thresholds to guarantee individual anonymity.
          </p>
        </div>

      </div>

    </div>
  );
};
