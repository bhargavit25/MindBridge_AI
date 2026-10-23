import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CrisisBanner } from '../components/CrisisBanner';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F3] text-[#293B38] font-sans">
      <CrisisBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

