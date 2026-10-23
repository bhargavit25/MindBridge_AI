import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Lock, Mail, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'counsellor') {
        navigate('/counsellor/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 font-sans text-[#293B38]">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40]">
              <HeartHandshake className="w-5 h-5 text-[#294A40]" />
            </div>
          </Link>
          <h2 className="text-2xl font-semibold text-[#293B38] tracking-tight">
            Welcome to MindBridge AI
          </h2>
          <p className="text-xs text-[#78817D]">
            Sign in to access your confidential student wellness space.
          </p>
        </div>

        {/* Demo Credentials Quick Switcher Banner */}
        <div className="bg-[#E9EDE2] border border-[#DCE5D5] rounded-3xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#294A40]">
            <Sparkles className="w-3.5 h-3.5 text-[#294A40]" />
            <span>Project Demo Quick-Fill:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('student@mindbridge.edu', 'Student@123456')}
              className="px-2.5 py-1.5 bg-[#FBFAF6] hover:bg-[#DCE5D5] border border-[#DCE5D5] text-[#293B38] rounded-xl text-[11px] font-medium transition-colors text-center"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('counsellor@mindbridge.edu', 'Counsellor@123456')}
              className="px-2.5 py-1.5 bg-[#FBFAF6] hover:bg-[#DCE5D5] border border-[#DCE5D5] text-[#293B38] rounded-xl text-[11px] font-medium transition-colors text-center"
            >
              🩺 Counsellor
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@mindbridge.edu', 'Admin@123456')}
              className="px-2.5 py-1.5 bg-[#FBFAF6] hover:bg-[#DCE5D5] border border-[#DCE5D5] text-[#293B38] rounded-xl text-[11px] font-medium transition-colors text-center"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Form Card */}
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
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@mindbridge.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#78817D] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#969D97] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[#FBFAF6] border border-[#E5E8DF] text-[#293B38] placeholder:text-[#969D97] focus:outline-none focus:border-[#294A40]"
                />
              </div>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-[#78817D] border-t border-[#E5E8DF]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#294A40] hover:underline">
              Begin Your Journey
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
