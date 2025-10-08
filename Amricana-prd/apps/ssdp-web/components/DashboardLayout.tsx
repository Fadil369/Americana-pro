import { useState, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  locale?: string;
  isRTL?: boolean;
}

const DashboardLayout = ({ children, locale = 'ar', isRTL = true }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-oasis text-white">
      <div className="fixed inset-0 -z-10 bg-mesh-oasis" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.12),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_45%),linear-gradient(120deg,rgba(15,23,42,0.95),rgba(15,23,42,0.85))]" />

      <div className="flex">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          locale={locale} 
          isRTL={isRTL} 
        />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
            locale={locale} 
            isRTL={isRTL} 
          />
          <main className="flex-1 space-y-6 px-6 pb-12 pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
