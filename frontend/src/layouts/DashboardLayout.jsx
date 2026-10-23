import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CrisisBanner } from '../components/CrisisBanner';
import {
  HeartHandshake,
  Home,
  MessageSquare,
  ClipboardCheck,
  Smile,
  BookHeart,
  CalendarCheck,
  CalendarDays,
  Library,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  BarChart3,
  Sparkles
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/assessments') {
      return location.pathname.startsWith('/assessments');
    }
    return location.pathname === path;
  };

  const studentLinks = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'AI Assistant', path: '/chat', icon: MessageSquare, highlight: true },
    { label: 'Assessments', path: '/assessments', icon: ClipboardCheck },
    { label: 'Mood Tracker', path: '/mood', icon: Smile },
    { label: 'Mood Journal', path: '/journal', icon: BookHeart },
    { label: 'Counsellors', path: '/counsellors', icon: CalendarCheck },
    { label: 'Appointments', path: '/appointments', icon: CalendarDays },
    { label: 'Resources', path: '/resources', icon: Library },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const counsellorLinks = [
    { label: 'Counsellor Portal', path: '/counsellor/dashboard', icon: Home },
    { label: 'Appointments', path: '/counsellor/appointments', icon: CalendarDays },
    { label: 'Availability Slots', path: '/counsellor/availability', icon: CalendarCheck },
    { label: 'Resources', path: '/resources', icon: Library },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Institutional Analytics', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Resources', path: '/resources', icon: Library },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const currentLinks = 
    user?.role === 'counsellor' ? counsellorLinks :
    user?.role === 'admin' ? adminLinks :
    studentLinks;

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col font-sans text-[#293B38]">
      <CrisisBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-[#FBFAF6] border-r border-[#E5E8DF] p-4 shrink-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 px-3 py-3 mb-4 group">
            <div className="w-9 h-9 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40] transition-transform duration-200 group-hover:scale-105">
              <HeartHandshake className="w-5 h-5 text-[#294A40]" />
            </div>
            <div>
              <div className="font-semibold text-base tracking-tight text-[#293B38] leading-none">
                MindBridge <span className="text-[#294A40] font-bold">AI</span>
              </div>
              <div className="text-[10px] text-[#78817D] tracking-wider uppercase font-medium mt-0.5">
                Wellness Space
              </div>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            <div className="text-[10px] font-medium text-[#969D97] uppercase tracking-wider px-3 pb-2 pt-1">
              {user?.role === 'counsellor' ? 'Counsellor Portal' : user?.role === 'admin' ? 'Institutional Analytics' : 'Student Space'}
            </div>

            {currentLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[#E9EDE2] text-[#294A40] font-semibold border border-[#DCE5D5]'
                      : 'text-[#78817D] hover:text-[#293B38] hover:bg-[#E9EDE2]/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#294A40]' : 'text-[#78817D]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !active && (
                    <span className="flex items-center gap-0.5 text-[9px] bg-[#DCE5D5] text-[#294A40] px-1.5 py-0.5 rounded-full font-semibold">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card & Sign out */}
          <div className="pt-3 border-t border-[#E5E8DF] mt-2 space-y-1.5">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-[#E9EDE2] transition-colors border border-transparent hover:border-[#DCE5D5]"
            >
              <div className="w-8 h-8 rounded-full bg-[#E9EDE2] text-[#294A40] border border-[#DCE5D5] flex items-center justify-center font-semibold text-xs uppercase shrink-0">
                {user?.display_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#293B38] truncate">{user?.display_name}</div>
                <div className="text-[10px] text-[#78817D] capitalize">{user?.role} Account</div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#78817D] hover:text-rose-700 hover:bg-rose-50/60 rounded-2xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile Top Header */}
          <header className="lg:hidden bg-[#FBFAF6] border-b border-[#E5E8DF] px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-2xl bg-[#E9EDE2] border border-[#DCE5D5] flex items-center justify-center text-[#294A40]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-[#293B38]">MindBridge AI</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#293B38] hover:bg-[#E9EDE2] rounded-full transition-colors"
              aria-label="Toggle navigation drawer"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile Dropdown Nav */}
          {sidebarOpen && (
            <div className="lg:hidden bg-[#FBFAF6] border-b border-[#E5E8DF] p-4 space-y-1 shadow-sm animate-fade-in">
              <div className="text-[10px] font-medium text-[#969D97] uppercase tracking-wider px-3 mb-1">
                Navigation
              </div>
              {currentLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-medium ${
                    isActive(item.path)
                      ? 'bg-[#E9EDE2] text-[#294A40] font-semibold border border-[#DCE5D5]'
                      : 'text-[#78817D] hover:bg-[#E9EDE2]/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-[#E5E8DF] mt-2 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-3 py-2 text-xs font-medium text-[#293B38] hover:bg-[#E9EDE2] rounded-2xl"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-2xl flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Page Outlet */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

