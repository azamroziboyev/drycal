import React, { useState } from 'react';
import { 
  Calculator, 
  FileText, 
  History, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Layers,
  Menu,
  X,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { UzNimLogo } from './UzNimLogo';

export type ActiveTab = 'calculate' | 'certificate' | 'protocol' | 'history' | 'audit';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  username: string;
  onLogout: () => void;
  savedCertCount: number;
  lastAutoSavedTime?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  username,
  onLogout,
  savedCertCount,
  lastAutoSavedTime
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      id: 'calculate' as ActiveTab,
      label: 'Hisob-kitob',
      sublabel: 'O‘lchash va noaniqlik',
      icon: Calculator
    },
    {
      id: 'certificate' as ActiveTab,
      label: 'Sertifikat (PDF)',
      sublabel: '4 sahifali rasmiy blank (PDF)',
      icon: FileText
    },
    {
      id: 'protocol' as ActiveTab,
      label: 'Bayonnoma (Excel)',
      sublabel: 'MS Excel interaktiv tahrirlovchi (.xlsx)',
      icon: FileSpreadsheet
    },
    {
      id: 'history' as ActiveTab,
      label: 'Sertifikatlar tarixi',
      sublabel: 'Barcha arxiv hisobotlar',
      icon: History,
      badge: savedCertCount
    },
    {
      id: 'audit' as ActiveTab,
      label: 'Kirishlar & Qurilmalar',
      sublabel: 'Xavfsizlik audit jurnali',
      icon: ShieldCheck
    }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Top Brand Section */}
      <div>
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-lg shadow-xs shrink-0 flex items-center justify-center">
              <UzNimLogo size={36} />
            </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none block">
                  O‘zMMI
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-1">
                  Kalibrlash tizimi
                </span>
              </div>
          </div>

          {/* Close button for mobile */}
          <button 
            type="button" 
            onClick={() => setMobileOpen(false)}
            aria-label="Menyuni yopish"
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="mt-4 space-y-1.5" aria-label="Chap panel menyusi">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <div className="truncate">
                    <div className="text-xs truncate">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile, Theme & Logout Section */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* User Info Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {username}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Kalibrator
              </div>
            </div>
          </div>

          {/* Theme switcher button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
            title={isDarkMode ? "Yorug' rejim" : "Tungi rejim"}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Tizimdan chiqish</span>
        </button>

        {/* Institution note */}
        <div className="text-[10px] text-center text-slate-400 dark:text-slate-500">
          O‘zbekiston Milliy Metrologiya Instituti (O‘zMMI)
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Menyuni ochish"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="p-0.5 bg-white rounded-md shadow-xs shrink-0 flex items-center justify-center">
            <UzNimLogo size={28} />
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            O‘zMMI Kalibrlash
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {username}
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Panel */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>
    </>
  );
};
