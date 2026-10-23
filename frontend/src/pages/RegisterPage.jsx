import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [agreed, setAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('Please acknowledge the privacy & non-diagnostic notice.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(displayName, email, password, role);
      if (user.role === 'counsellor') {
        navigate('/counsellor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans text-[#293B38]">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40]">
              <HeartHandshake className="w-5 h-5 text-[#294A40]" />
            </div>
          </Link>
          <h2 className="text-2xl font-semibold text-[#293B38] tracking-tight">
            Create Your Wellness Account
          </h2>
          <p className="text-xs text-[#78817D]">
            A safe, confidential space designed for student mental health.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#FBFAF6] p-7 rounded-3xl border border-[#E5E8DF] shadow-[0_2px_12px_rgba(41,59,56,0.03)] space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Preferred Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Chen"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@mindbridge.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 text-xs rounded-xl font-medium border transition-colors ${
                    role === 'student'
                      ? 'bg-[#E9EDE2] border-[#294A40] text-[#294A40] font-semibold'
                      : 'bg-[#FBFAF6] border-[#E5E8DF] text-[#78817D]'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('counsellor')}
                  className={`py-2 text-xs rounded-xl font-medium border transition-colors ${
                    role === 'counsellor'
                      ? 'bg-[#E9EDE2] border-[#294A40] text-[#294A40] font-semibold'
                      : 'bg-[#FBFAF6] border-[#E5E8DF] text-[#78817D]'
                  }`}
                >
                  Counsellor
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 text-[11px] text-[#78817D]">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded text-[#294A40] focus:ring-[#294A40] mt-0.5"
              />
              <label htmlFor="agree">
                I understand this platform offers supportive psychoeducation and is not a medical emergency service.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Creating account...
                </>
              ) : (
                'Begin Your Journey'
              )}
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-[#78817D] border-t border-[#E5E8DF]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#294A40] hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
