import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ClipboardCheck, 
  Smile, 
  CalendarCheck, 
  ArrowRight, 
  Lock, 
  ChevronDown, 
  HeartHandshake, 
  MessageSquare, 
  ShieldCheck,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Is my personal data and journal completely confidential?",
      a: "Yes. All personal mood logs, private reflections, and assessment submissions are strictly isolated to your individual account. MindBridge AI does not expose student journal entries or chat transcripts to institutional administrators or third parties."
    },
    {
      q: "Does MindBridge Assistant replace a human therapist or doctor?",
      a: "No. MindBridge AI is an educational and supportive psychological psychoeducation tool. It does not provide medical diagnoses or prescribe medications. When clinical intervention is indicated, MindBridge actively connects you directly to campus counsellors."
    },
    {
      q: "What happens if someone indicates self-harm or immediate crisis?",
      a: "MindBridge AI features a dedicated crisis safety interception layer that immediately provides compassionate intervention and verified 24/7 emergency helplines such as Tele-MANAS (14416 / 1800-891-4416) and 988 Lifeline."
    },
    {
      q: "Are the PHQ-9 and GAD-7 assessments diagnostic tests?",
      a: "No. PHQ-9 and GAD-7 are widely validated clinical screening questionnaires used globally to measure symptom severity over a 2-week window. They indicate whether symptoms are minimal, mild, moderate, or severe, but formal diagnoses require licensed medical evaluation."
    },
    {
      q: "Can I book appointments with campus psychological counsellors?",
      a: "Yes. Students can view verified counsellor profiles, their areas of expertise (e.g., CBT, exam panic, burnout), and available consultation time slots to book confidential sessions without double-booking conflicts."
    }
  ];

  const features = [
    {
      title: "Talk to MindBridge AI",
      description: "A calm, non-judgmental space to reflect on your thoughts, practice grounding, and get personalized self-care ideas.",
      icon: MessageSquare,
      to: "/chat",
      badge: "AI Companion"
    },
    {
      title: "Check Your Wellbeing",
      description: "Standardized clinical screeners (PHQ-9 and GAD-7) designed to help you gently track depression and anxiety trends.",
      icon: ClipboardCheck,
      to: "/assessments",
      badge: "Clinical Screeners"
    },
    {
      title: "Track Your Mood",
      description: "Log daily emotional states and private journal reflections in a quiet, distraction-free personal sanctuary.",
      icon: Smile,
      to: "/mood",
      badge: "Private Journal"
    },
    {
      title: "Find a Counsellor",
      description: "Explore verified campus psychologists and reserve confidential 1-on-1 consultations that fit your class schedule.",
      icon: CalendarCheck,
      to: "/counsellors",
      badge: "Confidential Care"
    }
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20 font-sans text-[#293B38]">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-20 overflow-hidden">
        {/* Subtle organic background elements */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#E9EDE2]/50 blur-3xl -z-10 rounded-full pointer-events-none" />
        <div className="absolute top-28 right-10 w-72 h-72 bg-[#FBF4EE]/80 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          
          {/* Subtle reassurance pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9EDE2] border border-[#DCE5D5] text-[#294A40] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#294A40]" />
            <span>Digital Mental Wellness & Support for Students</span>
          </div>

          {/* Hero Heading & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-semibold text-[#293B38] tracking-tight leading-[1.15]">
              Your Mind Matters.
            </h1>
            <p className="text-base sm:text-xl text-[#78817D] max-w-2xl mx-auto font-normal leading-relaxed">
              A safe space to understand your emotions, care for your mental wellness, and find support whenever you need it.
            </p>
          </div>

          {/* Small Reassurance Note */}
          <div className="text-xs sm:text-sm text-[#294A40] bg-[#E9EDE2]/60 inline-block px-4 py-1.5 rounded-full border border-[#DCE5D5]">
            "You don't have to figure everything out alone."
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                <span>Begin Your Journey</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <span>Explore MindBridge</span>
                <ChevronDown className="w-4 h-4 ml-1 text-[#78817D]" />
              </Button>
            </a>
          </div>

          {/* Small Organic Botanical SVG Motif */}
          <div className="pt-6 flex justify-center opacity-70">
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 25C15 15 25 10 30 10C35 10 45 15 50 25" stroke="#A9BDA5" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 10V25" stroke="#A9BDA5" strokeWidth="2" strokeLinecap="round" />
              <circle cx="30" cy="8" r="3" fill="#DCE5D5" />
            </svg>
          </div>

          {/* Confidentiality Trust Badges */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#294A40] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#293B38]">100% Private</div>
                <div className="text-[10px] text-[#78817D]">Strict Data Isolation</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] flex items-center gap-2.5">
              <ClipboardCheck className="w-4 h-4 text-[#294A40] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#293B38]">PHQ-9 & GAD-7</div>
                <div className="text-[10px] text-[#78817D]">Validated Screeners</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#294A40] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#293B38]">MindBridge AI</div>
                <div className="text-[10px] text-[#78817D]">Psychoeducation</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] flex items-center gap-2.5">
              <HeartHandshake className="w-4 h-4 text-[#294A40] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#293B38]">Counsellors</div>
                <div className="text-[10px] text-[#78817D]">Campus Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-medium uppercase tracking-wider text-[#78817D]">
            Thoughtfully Designed Tools
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#293B38]">
            Support, whenever you need it
          </h2>
          <p className="text-xs sm:text-sm text-[#78817D]">
            Every feature is shaped to nurture calm, reflection, and proactive mental care without pressure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} variant="default" hover={true} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] text-[#294A40] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#294A40]" />
                    </div>
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#E9EDE2] text-[#294A40]">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-[#293B38] mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#78817D] leading-relaxed">
                    {f.description}
                  </p>
                </div>
                <div className="pt-5">
                  <Link to={f.to} className="inline-flex items-center gap-1 text-xs font-medium text-[#294A40] hover:text-[#1F3831]">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. CALM GENTLE BREATHING / REASSURANCE CARD */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#E9EDE2] border border-[#DCE5D5] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#294A40]">
              Gentle Pause
            </span>
            <h3 className="text-xl sm:text-2xl font-semibold text-[#293B38]">
              Take a moment for yourself right now.
            </h3>
            <p className="text-xs sm:text-sm text-[#78817D] max-w-md leading-relaxed">
              Inhale deeply for 4 seconds, hold gently for 4, and release for 4. You are doing the best you can today.
            </p>
          </div>
          <Link to="/register">
            <Button variant="primary" size="md">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#78817D]">
            Clear & Transparent
          </span>
          <h2 className="text-2xl font-semibold text-[#293B38]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#78817D]">
            Everything you need to know about privacy, screening validity, and care.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] transition-all duration-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 select-none"
              >
                <span className="font-medium text-xs sm:text-sm text-[#293B38]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#78817D] shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-[#294A40]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-[#78817D] leading-relaxed border-t border-[#E5E8DF]/60 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. GENTLE CLOSING CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] space-y-4 shadow-[0_2px_12px_rgba(41,59,56,0.03)]">
          <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40] mx-auto">
            <HeartHandshake className="w-5 h-5 text-[#294A40]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#293B38]">
            Ready to explore a safer, calmer space?
          </h2>
          <p className="text-xs sm:text-sm text-[#78817D] max-w-md mx-auto leading-relaxed">
            Create your private account in under a minute. No institutional reporting, no public social feeds—just your confidential sanctuary.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button size="lg" variant="primary">
                Begin Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
