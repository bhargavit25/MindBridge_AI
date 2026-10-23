import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, AlertCircle, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#FBFAF6] text-[#78817D] pt-14 pb-10 border-t border-[#E5E8DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E5E8DF]">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40]">
                <HeartHandshake className="w-4 h-4 text-[#294A40]" />
              </div>
              <span className="font-semibold text-base text-[#293B38]">MindBridge AI</span>
            </div>
            <p className="text-xs text-[#294A40] font-medium leading-relaxed">
              "Your Mind Matters. A safe space for your wellbeing."
            </p>
            <p className="text-xs text-[#78817D] leading-relaxed">
              A gentle, confidential psychological support space created to help students understand emotions, practice self-care, and connect with help.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#294A40] pt-1">
              <Shield className="w-3.5 h-3.5 text-[#294A40]" />
              <span>Confidential & Private</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#293B38] uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/resources" className="hover:text-[#293B38] transition-colors">Self-Help Resources</Link></li>
              <li><Link to="/assessments/phq9" className="hover:text-[#293B38] transition-colors">PHQ-9 Depression Screener</Link></li>
              <li><Link to="/assessments/gad7" className="hover:text-[#293B38] transition-colors">GAD-7 Anxiety Screener</Link></li>
              <li><Link to="/counsellors" className="hover:text-[#293B38] transition-colors">Campus Counsellors</Link></li>
              <li><Link to="/login" className="hover:text-[#293B38] transition-colors">Student Sign In</Link></li>
            </ul>
          </div>

          {/* Ethics & External */}
          <div>
            <h4 className="text-xs font-semibold text-[#293B38] uppercase tracking-wider mb-3">Support & Helplines</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-[#293B38] transition-colors">About & Ethics</Link></li>
              <li><Link to="/privacy" className="hover:text-[#293B38] transition-colors">Data Privacy Guarantee</Link></li>
              <li>
                <a href="https://telemanas.mohfw.gov.in/" target="_blank" rel="noreferrer" className="hover:text-[#293B38] inline-flex items-center gap-1 transition-colors">
                  Tele-MANAS (14416) <ExternalLink className="w-3 h-3 text-[#969D97]" />
                </a>
              </li>
              <li>
                <a href="https://988lifeline.org/" target="_blank" rel="noreferrer" className="hover:text-[#293B38] inline-flex items-center gap-1 transition-colors">
                  988 Suicide & Crisis Lifeline <ExternalLink className="w-3 h-3 text-[#969D97]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Calming Disclaimer */}
          <div className="bg-[#E9EDE2]/60 p-4 rounded-3xl border border-[#DCE5D5] space-y-2">
            <div className="flex items-center gap-2 text-[#294A40] font-medium text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#294A40]" />
              <span>Healthcare Notice</span>
            </div>
            <p className="text-[11px] text-[#293B38] leading-relaxed">
              MindBridge AI is an educational wellness tool and is not a clinical medical service. It is designed to offer supportive psychoeducation and connect you with qualified campus resources.
            </p>
            <div className="text-[11px] text-[#294A40] font-semibold pt-1">
              Urgent Help: Call <span className="underline">14416</span> or <span className="underline">988</span> (24/7).
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#969D97]">
          <p>© {new Date().getFullYear()} MindBridge AI — College Mental Wellness System.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Designed for emotional comfort, safety, and accessible student care.
          </p>
        </div>
      </div>
    </footer>
  );
};

