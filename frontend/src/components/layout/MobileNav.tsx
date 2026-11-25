import React from 'react';
import { Award, Bot, Clapperboard, Home, LayoutDashboard, Map } from 'lucide-react';
import { useLanguage } from '../../context/hooks';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const items = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'reels', label: t('nav.reels'), icon: Clapperboard },
    { id: 'assistant', label: t('nav.assistant'), icon: Bot },
    { id: 'indoor', label: t('nav.indoor'), icon: Home },
    { id: 'map', label: t('nav.map'), icon: Map },
    { id: 'impact', label: t('nav.impact'), icon: Award },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition max-w-[64px] ${
              isActive ? 'text-teal-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-400' : 'text-neutral-400'}`} aria-hidden="true" />
            <span className="text-[10px] truncate w-full text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
