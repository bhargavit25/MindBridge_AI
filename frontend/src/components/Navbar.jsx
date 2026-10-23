import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  Compass
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#FBFAF6]/90 backdrop-blur-md border-b border-[#E5E8DF] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40] transition-transform duration-200 group-hover:scale-105">
              <HeartHandshake className="w-5 h-5 text-[#294A40]" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#293B38]">
                MindBridge <span className="text-[#294A40] font-bold">AI</span>
              </span>
              <span className="text-[10px] text-[#78817D] tracking-wider uppercase font-medium -mt-1">
                Student Wellness
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link 
              to="/" 
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive('/') ? 'bg-[#E9EDE2] text-[#294A40] font-semibold' : 'text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]/50'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/resources" 
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive('/resources') ? 'bg-[#E9EDE2] text-[#294A40] font-semibold' : 'text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]/50'
              }`}
            >
              Resources
            </Link>
            <Link 
              to="/about" 
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive('/about') ? 'bg-[#E9EDE2] text-[#294A40] font-semibold' : 'text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]/50'
              }`}
            >
              About
            </Link>
            <Link 
              to="/privacy" 
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive('/privacy') ? 'bg-[#E9EDE2] text-[#294A40] font-semibold' : 'text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]/50'
              }`}
            >
              Confidentiality
            </Link>

            {user && (
              <>
                <div className="h-4 w-px bg-[#E5E8DF] mx-1" />
                {user.role === 'student' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive('/dashboard') ? 'bg-[#294A40] text-[#FBFAF6] font-semibold' : 'text-[#293B38] hover:bg-[#E9EDE2]'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                    <Link
                      to="/chat"
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isActive('/chat') ? 'bg-[#294A40] text-[#FBFAF6] font-semibold' : 'text-[#294A40] hover:bg-[#E9EDE2]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#294A40]" /> AI Assistant
                    </Link>
                  </>
                )}

                {user.role === 'counsellor' && (
                  <Link
                    to="/counsellor/dashboard"
                    className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-[#E9EDE2] text-[#294A40] font-semibold"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> Counsellor Portal
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-[#E9EDE2] text-[#294A40] font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Institutional Analytics
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E9EDE2] hover:bg-[#DCE5D5] text-[#293B38] text-xs font-medium border border-[#DCE5D5] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#294A40]" />
                  <span className="max-w-[120px] truncate">{user.display_name}</span>
                  <span className="px-1.5 py-0.2 text-[10px] bg-[#DCE5D5] text-[#294A40] rounded-full capitalize font-semibold">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2] rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-[#293B38] hover:text-[#294A40] px-3.5 py-2 rounded-full hover:bg-[#E9EDE2] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-[#FBFAF6] bg-[#294A40] hover:bg-[#1F3831] px-4 py-2 rounded-full shadow-sm transition-all"
                >
                  Begin Your Journey
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#293B38] hover:bg-[#E9EDE2] rounded-full transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBFAF6] border-b border-[#E5E8DF] px-4 pt-3 pb-6 space-y-2 shadow-sm animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
          >
            Home
          </Link>
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
          >
            Self-Help Resources
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
          >
            About & Ethics
          </Link>
          <Link
            to="/privacy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
          >
            Confidentiality
          </Link>

          {user ? (
            <div className="pt-3 border-t border-[#E5E8DF] space-y-1">
              <div className="text-[11px] font-medium text-[#78817D] uppercase tracking-wider px-3 mb-1">
                Account ({user.role})
              </div>
              {user.role === 'student' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#294A40] bg-[#E9EDE2]"
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
                  >
                    AI Assistant
                  </Link>
                  <Link
                    to="/assessments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
                  >
                    Assessments
                  </Link>
                  <Link
                    to="/mood"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
                  >
                    Mood Tracker
                  </Link>
                  <Link
                    to="/journal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
                  >
                    Private Journal
                  </Link>
                  <Link
                    to="/counsellors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
                  >
                    Book a Counsellor
                  </Link>
                </>
              )}
              {user.role === 'counsellor' && (
                <Link
                  to="/counsellor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#294A40] bg-[#E9EDE2]"
                >
                  Counsellor Portal
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#294A40] bg-[#E9EDE2]"
                >
                  Institutional Analytics
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-2xl text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2]"
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-2xl text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#E5E8DF] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-medium text-[#293B38] border border-[#E5E8DF] rounded-full hover:bg-[#E9EDE2]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 text-xs font-semibold text-[#FBFAF6] bg-[#294A40] rounded-full shadow-sm"
              >
                Begin Your Journey
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

