
import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="container p-6 animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
