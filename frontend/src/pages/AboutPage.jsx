import React from 'react';
import { HeartHandshake, Shield, Brain, Cpu } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12 font-sans text-[#293B38]">
      
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#294A40] bg-[#E9EDE2] px-3 py-1 rounded-full border border-[#DCE5D5]">
          Project Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-semibold text-[#293B38] tracking-tight">
          About MindBridge AI
        </h1>
        <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
          Digital Mental Health and Psychological Support System for Higher Education Students.
        </p>
      </div>

      <div className="bg-[#FBFAF6] p-8 sm:p-10 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_10px_rgba(41,59,56,0.03)] space-y-4">
        <h2 className="text-lg font-semibold text-[#293B38]">Purpose & Core Philosophy</h2>
        <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
          Higher education students navigate unique challenges, from exam anxiety and academic burnout to sleep disruptions and social transitions. Traditional campus wellness resources often carry perceived friction or stigma that delays early support.
        </p>
        <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
          <strong>MindBridge AI</strong> is designed as a calm, confidential first-line bridge—giving students accessible psychoeducation, self-reflection screeners (PHQ-9 and GAD-7), and an easy way to connect with professional campus counsellors whenever needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FBFAF6] p-6 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.02)] space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#294A40]" />
          </div>
          <h3 className="font-semibold text-sm text-[#293B38]">Evidence-Based Principles</h3>
          <p className="text-xs text-[#78817D] leading-relaxed">
            Draws upon Cognitive Behavioral Therapy (CBT) insights, box breathing, and gentle sensory grounding exercises.
          </p>
        </div>

        <div className="bg-[#FBFAF6] p-6 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.02)] space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-[#294A40]" />
          </div>
          <h3 className="font-semibold text-sm text-[#293B38]">Privacy-First AI</h3>
          <p className="text-xs text-[#78817D] leading-relaxed">
            Local vector indexing and educational retrieval ensure your conversations remain confidential to your student space.
          </p>
        </div>

        <div className="bg-[#FBFAF6] p-6 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_8px_rgba(41,59,56,0.02)] space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#294A40]" />
          </div>
          <h3 className="font-semibold text-sm text-[#293B38]">Compassionate Guardrails</h3>
          <p className="text-xs text-[#78817D] leading-relaxed">
            Non-diagnostic boundaries and direct integration with verified emergency hotlines (Tele-MANAS, 988 Lifeline).
          </p>
        </div>
      </div>

    </div>
  );
};
