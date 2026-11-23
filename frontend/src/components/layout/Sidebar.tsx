import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Users,
  Home,
  CalendarCheck,
  Map,
  UsersRound,
  Award,
  BookOpen,
  ShieldCheck,
  Settings,
  TrendingUp,
  Clapperboard,
} from 'lucide-react';
import { useLanguage, useAuth } from '../../context/hooks';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'reels', label: t('nav.reels'), icon: Clapperboard, badge: 'Reels' },
    { id: 'assistant', label: t('nav.assistant'), icon: Bot, badge: 'GenAI' },
    { id: 'family', label: t('nav.family'), icon: Users },
    { id: 'indoor', label: t('nav.indoor'), icon: Home },
    { id: 'routine', label: t('nav.routine'), icon: CalendarCheck },
    { id: 'prediction', label: 'Predictions', icon: TrendingUp },
    { id: 'map', label: t('nav.map'), icon: Map },
    { id: 'community', label: t('nav.community'), icon: UsersRound },
    { id: 'impact', label: t('nav.impact'), icon: Award },
    { id: 'education', label: t('nav.education'), icon: BookOpen },
  ];

  // Admin portal access
  const hasAdminAccess = user && ['super_admin', 'moderator', 'community_manager'].includes(user.role);

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="hidden md:flex flex-col w-64 border-r border-neutral-800 bg-neutral-950/70 p-4 space-y-6 shrink-0 min-h-[calc(100vh-65px)]"
    >
      <nav aria-label="Primary Features" className="space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-neutral-400'}`} aria-hidden="true" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-500/30 text-teal-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-neutral-800/80 space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
          Management
        </div>

        {hasAdminAccess && (
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'admin'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-purple-400' : 'text-neutral-400'}`} aria-hidden="true" />
            <span>{t('nav.admin')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          aria-current={activeTab === 'settings' ? 'page' : undefined}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
            activeTab === 'settings'
              ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-teal-400' : 'text-neutral-400'}`} aria-hidden="true" />
          <span>{t('nav.settings')}</span>
        </button>
      </div>

      {/* Environmental disclaimer footer */}
      <div className="mt-auto p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
        <span className="text-teal-400 font-bold block mb-1">ClearSky Standard</span>
        Separating verified sensor ground observations from estimated personal impact calculations.
      </div>
    </aside>
  );
};
