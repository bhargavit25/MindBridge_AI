import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';

// Student Pages
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { AssessmentsHubPage } from './pages/AssessmentsHubPage';
import { PHQ9Page } from './pages/PHQ9Page';
import { GAD7Page } from './pages/GAD7Page';
import { MoodPage } from './pages/MoodPage';
import { JournalPage } from './pages/JournalPage';
import { CounsellorsDirectoryPage } from './pages/CounsellorsDirectoryPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ProfilePage } from './pages/ProfilePage';

// Counsellor & Admin Pages
import { CounsellorPortalPage } from './pages/CounsellorPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Route>

          {/* Protected Routes with DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Student routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/assessments" element={<AssessmentsHubPage />} />
            <Route path="/assessments/phq9" element={<PHQ9Page />} />
            <Route path="/assessments/gad7" element={<GAD7Page />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/counsellors" element={<CounsellorsDirectoryPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Counsellor routes */}
            <Route
              path="/counsellor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                  <CounsellorPortalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counsellor/appointments"
              element={
                <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/counsellor/availability"
              element={
                <ProtectedRoute allowedRoles={['counsellor', 'admin']}>
                  <CounsellorPortalPage />
                </ProtectedRoute>
              }
            />

            {/* Administrator routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
