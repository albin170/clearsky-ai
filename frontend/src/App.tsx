import React, { Suspense, lazy, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AuthModal } from './components/layout/AuthModal';
import { DashboardView } from './components/dashboard/DashboardView';

const ReelsView = lazy(() => import('./components/reels/ReelsView').then((m) => ({ default: m.ReelsView })));
const AssistantView = lazy(() =>
  import('./components/assistant/AssistantView').then((m) => ({ default: m.AssistantView })),
);
const FamilyView = lazy(() => import('./components/family/FamilyView').then((m) => ({ default: m.FamilyView })));
const IndoorView = lazy(() => import('./components/indoor/IndoorView').then((m) => ({ default: m.IndoorView })));
const RoutineView = lazy(() => import('./components/routine/RoutineView').then((m) => ({ default: m.RoutineView })));
const PredictionView = lazy(() =>
  import('./components/prediction/PredictionView').then((m) => ({ default: m.PredictionView })),
);
const MapView = lazy(() => import('./components/map/MapView').then((m) => ({ default: m.MapView })));
const CommunityView = lazy(() =>
  import('./components/community/CommunityView').then((m) => ({ default: m.CommunityView })),
);
const ImpactView = lazy(() => import('./components/impact/ImpactView').then((m) => ({ default: m.ImpactView })));
const EducationView = lazy(() =>
  import('./components/education/EducationView').then((m) => ({ default: m.EducationView })),
);
const AdminView = lazy(() => import('./components/admin/AdminView').then((m) => ({ default: m.AdminView })));
const SettingsView = lazy(() =>
  import('./components/settings/SettingsView').then((m) => ({ default: m.SettingsView })),
);

const ViewFallback: React.FC = () => (
  <div role="status" aria-live="polite" className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
    <div className="w-10 h-10 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
    <span className="text-xs text-neutral-400 font-medium">Loading environmental intelligence module...</span>
  </div>
);

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'reels':
        return <ReelsView onNavigateTab={setActiveTab} />;
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-teal-600 focus:text-white focus:font-bold focus:text-xs"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-hidden">
          <Suspense fallback={<ViewFallback />}>{renderActiveView()}</Suspense>
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
