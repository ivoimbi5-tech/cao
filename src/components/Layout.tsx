import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Wallet, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  Instagram,
  Music2
} from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const SidebarItem = ({ 
  to, 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  to: string; 
  icon: any; 
  label: string; 
  active: boolean;
  onClick?: () => void;
  key?: string;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-emerald-500" : "group-hover:text-zinc-100")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/new-order', icon: PlusCircle, label: 'Novo Pedido' },
    { to: '/dashboard/history', icon: History, label: 'Histórico' },
    { to: '/dashboard/add-balance', icon: Wallet, label: 'Adicionar Saldo' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#0f0f0f] border-r border-zinc-800/50 z-50 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Seguidores<span className="text-emerald-500">Express</span></span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-800/50 space-y-2">
            <div className="px-4 py-3 mb-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Saldo Atual</p>
              <p className="text-xl font-bold text-emerald-500">{profile?.balance.toLocaleString()} Kz</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-zinc-100">
              {navItems.find(item => item.to === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-zinc-100">{profile?.displayName}</p>
              <p className="text-xs text-zinc-500">{profile?.email}</p>
            </div>
            <div className="w-10 h-10 bg-zinc-800 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold">
              {profile?.displayName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
