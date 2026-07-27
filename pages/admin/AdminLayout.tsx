

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, ListOrdered, LogOut, Menu, X, MessageSquare, Settings, CreditCard } from 'lucide-react';
import { useAppStore } from '../../store';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NavLink: React.FC<{ icon: React.ElementType, label: string, onClick: () => void, notificationCount?: number }> = ({ icon: Icon, label, onClick, notificationCount = 0 }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between space-x-3 px-4 py-3 text-stone-500 hover:bg-white/5 hover:text-white rounded-none transition-all duration-200 group">
    <div className="flex items-center space-x-3">
      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
      <span className="font-admin font-bold text-[11px] uppercase tracking-widest">{label}</span>
    </div>
    {notificationCount > 0 && (
      <span className="bg-white text-stone-950 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-none shadow-lg shadow-white/5">
        {notificationCount}
      </span>
    )}
  </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { navigate, logout, contactMessages, newOrdersCount, loadAdminData } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Trigger admin data load when layout mounts (admin logs in or refreshes on admin page)
  useEffect(() => {
      loadAdminData();
  }, [loadAdminData]);

  const unreadMessagesCount = contactMessages.filter(msg => !msg.isRead).length;

  const handleNav = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-xl font-black text-white tracking-tighter uppercase font-admin">SAZO <span className="text-stone-500">ADMIN</span></h1>
        <p className="text-[8px] text-stone-600 font-bold uppercase tracking-[0.4em] mt-1 font-admin">Logistics Management</p>
      </div>
      <nav className="flex-1 p-6 space-y-1">
        <NavLink icon={LayoutDashboard} label="Dashboard" onClick={() => handleNav('/admin/dashboard')} />
        <NavLink icon={ShoppingBag} label="Products" onClick={() => handleNav('/admin/products')} />
        <NavLink icon={ListOrdered} label="Orders" onClick={() => handleNav('/admin/orders')} notificationCount={newOrdersCount} />
        <NavLink icon={MessageSquare} label="Messages" onClick={() => handleNav('/admin/messages')} notificationCount={unreadMessagesCount} />
        <NavLink icon={CreditCard} label="Payment Info" onClick={() => handleNav('/admin/payment-info')} />
        <NavLink icon={Settings} label="Settings" onClick={() => handleNav('/admin/settings')} />
      </nav>
      <div className="p-6 border-t border-white/5">
        <NavLink icon={LogOut} label="Logout" onClick={logout} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#E7E7E7]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-stone-950 text-white shadow-2xl z-20 border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm"></div>
      </div>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-full bg-stone-950 text-white transform transition-transform duration-500 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-stone-100 md:hidden sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-950 rounded-none flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <h1 className="text-sm font-black text-stone-900 tracking-tighter uppercase font-admin">SAZO <span className="text-stone-400">ADMIN</span></h1>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-stone-50 rounded-none text-stone-950 active:scale-95 transition-all">
            <Menu className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#E7E7E7] p-4 sm:p-6 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
