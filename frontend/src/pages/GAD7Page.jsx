import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  MessageSquare,
  CalendarCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

const OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" }
];

export const GAD7Page = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(7).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const currentQuestionText = GAD7_QUESTIONS[currentIndex];
  const selectedOption = answers[currentIndex];

  const handleSelectOption = (val) => {
    const updated = [...answers];
    updated[currentIndex] = val;
    setAnswers(updated);
    setError('');
  };

  const handleNext = () => {
    if (selectedOption === null) {
      setError('Please select an option to continue.');
      return;
    }
    setError('');
    if (currentIndex < GAD7_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (selectedOption === null) {
      setError('Please select an answer for this question.');
      return;
    }
    const finalAnswers = [...answers];
    finalAnswers[currentIndex] = selectedOption;

    if (finalAnswers.some((a) => a === null)) {
      setError('Please answer all 7 questions before submitting.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await api.submitGAD7(finalAnswers);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to submit GAD-7 screening.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers(Array(7).fill(null));
    setCurrentIndex(0);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6 px-4 font-sans text-[#293B38]">
      
      {/* Top Compact Tabs: PHQ-9 and GAD-7 */}
      <div className="flex items-center gap-2 mb-6 p-1.5 rounded-full bg-[#E9EDE2] border border-[#DCE5D5]">
        <Link
          to="/assessments/phq9"
          className="px-5 py-1.5 rounded-full text-xs font-medium text-[#78817D] hover:text-[#293B38] hover:bg-[#DCE5D5]/50 transition-all"
        >
          PHQ-9
        </Link>
        <Link
          to="/assessments/gad7"
          className="px-5 py-1.5 rounded-full text-xs font-semibold bg-[#294A40] text-[#FBFAF6] shadow-sm transition-all"
        >
          GAD-7
        </Link>
      </div>

      {/* Main Centered Question Container */}
      <div className="w-full max-w-xl">
        
        {!result ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_12px_rgba(41,59,56,0.03)] space-y-6">
            
            {/* Header Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[#78817D]">
                <span className="font-semibold text-[#294A40] uppercase tracking-wider text-[11px]">
                  GAD-7 SCREENING
                </span>
                <span>Anxiety screening</span>
              </div>
              <h2 className="text-sm font-medium text-[#78817D]">
                Question {currentIndex + 1} of {GAD7_QUESTIONS.length}
              </h2>
            </div>

            {/* Standardized Guidance Question */}
            <div className="space-y-3 pt-1">
              <p className="text-xs text-[#78817D] leading-relaxed italic">
                "Over the last 2 weeks, how often have you been bothered by the following problem?"
              </p>
              <h3 className="text-base sm:text-lg font-semibold text-[#293B38] leading-snug">
                {currentQuestionText}
              </h3>
            </div>

            {/* Separate Rounded Answer Cards */}
            <div className="space-y-2.5 pt-2">
              {OPTIONS.map((opt) => {
                const isSelected = selectedOption === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectOption(opt.value)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#DCE5D5] border-[#294A40] text-[#294A40] font-semibold shadow-sm'
                        : 'bg-[#FBFAF6] border-[#E5E8DF] text-[#293B38] hover:bg-[#E9EDE2] hover:border-[#DCE5D5]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#294A40] bg-[#294A40]'
                          : 'border-[#969D97] bg-transparent'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            )}

            {/* Progress Bar */}
            <div className="pt-2">
              <ProgressBar current={currentIndex + 1} total={GAD7_QUESTIONS.length} />
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              {currentIndex < GAD7_QUESTIONS.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    'Submit Screening'
                  )}
                </Button>
              )}
            </div>

          </div>
        ) : (
          /* Results Screen with supportive language */
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFAF6] border border-[#E5E8DF] shadow-[0_2px_12px_rgba(41,59,56,0.03)] space-y-6 animate-fade-in">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-[#294A40]" />
              </div>
              <h2 className="text-xl font-semibold text-[#293B38]">
                Screening Completed
              </h2>
              <p className="text-xs text-[#78817D]">
                Thank you for completing your anxiety check-in.
              </p>
            </div>

            {/* Score Summary Box */}
            <div className="p-5 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] space-y-2 text-center">
              <div className="text-[11px] font-medium text-[#78817D] uppercase tracking-wider">
                Total GAD-7 Score
              </div>
              <div className="text-3xl font-bold text-[#294A40]">
                {result.score} <span className="text-sm font-normal text-[#78817D]">/ 21</span>
              </div>
              <div className="text-sm font-semibold text-[#293B38]">
                Severity: {result.severity}
              </div>
            </div>

            {/* Supportive Interpretation */}
            <div className="p-4 rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] space-y-2">
              <h4 className="text-xs font-semibold text-[#293B38]">
                Supportive Reflection:
              </h4>
              <p className="text-xs text-[#78817D] leading-relaxed">
                {result.interpretation || "Anxiety is a common response to academic pressures and transitions. Self-check-ins give you space to acknowledge your feelings with compassion."}
              </p>
            </div>

            {/* Recommended Next Steps */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-semibold text-[#293B38]">
                Ways to support yourself now:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  to="/chat"
                  className="p-3 rounded-2xl bg-[#E9EDE2]/50 border border-[#DCE5D5] hover:bg-[#E9EDE2] transition-colors flex items-center gap-2 text-xs font-medium text-[#294A40]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Talk with AI Assistant</span>
                </Link>
                <Link
                  to="/counsellors"
                  className="p-3 rounded-2xl bg-[#E9EDE2]/50 border border-[#DCE5D5] hover:bg-[#E9EDE2] transition-colors flex items-center gap-2 text-xs font-medium text-[#294A40]"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Book Campus Counsellor</span>
                </Link>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E8DF]">
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleRestart}
              >
                Retake
              </Button>
              <Link to="/dashboard">
                <Button variant="primary" size="sm">
                  Return to Dashboard
                </Button>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
