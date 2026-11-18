import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AuthModal } from './components/layout/AuthModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { AssistantView } from './components/assistant/AssistantView';
import { FamilyView } from './components/family/FamilyView';
import { IndoorView } from './components/indoor/IndoorView';
import { RoutineView } from './components/routine/RoutineView';
import { PredictionView } from './components/prediction/PredictionView';
import { MapView } from './components/map/MapView';
import { CommunityView } from './components/community/CommunityView';
import { ImpactView } from './components/impact/ImpactView';
import { EducationView } from './components/education/EducationView';
import { AdminView } from './components/admin/AdminView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'assistant':
        return <AssistantView />;
      case 'family':
        return <FamilyView />;
      case 'indoor':
        return <IndoorView />;
      case 'routine':
        return <RoutineView />;
      case 'prediction':
        return <PredictionView />;
      case 'map':
        return <MapView />;
      case 'community':
        return <CommunityView />;
      case 'impact':
        return <ImpactView />;
      case 'education':
        return <EducationView />;
      case 'admin':
        return <AdminView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Sticky Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sign In / Registration Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Footer */}
      <footer className="hidden md:block border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ClearSky AI © 2026 • GenAI-Powered Winter Smog & Urban Air Pollution Intelligence Platform</span>
          <div className="flex items-center space-x-4">
            <span className="text-neutral-400">Data: Open-Meteo & CPCB NAQI Standard</span>
            <span className="text-teal-400">Production Quality</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <LocationProvider>
            <AppContent />
          </LocationProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
