import React from 'react';
import { LayoutDashboard, Bot, Home, Map, Award, Clapperboard } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', label: 'AQI', icon: LayoutDashboard },
    { id: 'reels', label: 'Reels', icon: Clapperboard },
    { id: 'assistant', label: 'AI Chat', icon: Bot },
    { id: 'indoor', label: 'Indoor', icon: Home },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'impact', label: 'Impact', icon: Award },
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
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition ${
              isActive ? 'text-teal-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-400' : 'text-neutral-400'}`} aria-hidden="true" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
