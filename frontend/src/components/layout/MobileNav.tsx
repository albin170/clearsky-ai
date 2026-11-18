import React from 'react';
import { LayoutDashboard, Bot, Users, Home, Map, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const items = [
    { id: 'dashboard', label: 'AQI', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Chat', icon: Bot },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'indoor', label: 'Indoor', icon: Home },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'impact', label: 'Impact', icon: Award },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition ${
              isActive ? 'text-teal-400 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-400' : 'text-neutral-400'}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
