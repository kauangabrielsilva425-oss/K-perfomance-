import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNav } from './components/HeaderNav';
import { HomeView } from './components/HomeView';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { RoutineBuilder } from './components/RoutineBuilder';
import { LiveWorkout } from './components/LiveWorkout';
import { MealPlanner } from './components/MealPlanner';
import { NutritionScience } from './components/NutritionScience';
import { FoodCatalog } from './components/FoodCatalog';
import { ShoppingList } from './components/ShoppingList';
import { SupplementsGuide } from './components/SupplementsGuide';
import { EvolutionTracker } from './components/EvolutionTracker';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal, UnauthorizedBarrier } from './components/AuthModal';
import { WhitelistModal } from './components/WhitelistModal';

const AppContent: React.FC = () => {
  const { currentTab } = useApp();
  const {
    user,
    isAuthorized,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isWhitelistModalOpen,
    setIsWhitelistModalOpen,
  } = useAuth();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // If a user logs in with an email that is not in the whitelist, enforce access barrier
  if (user && !isAuthorized) {
    return <UnauthorizedBarrier />;
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white relative">
      {/* Background Architectural K Watermark (Discreet, high-end, dark graphite, non-intrusive) */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center select-none opacity-[0.03]"
        aria-hidden="true"
      >
        <span className="font-display font-black text-[70vw] text-white leading-none tracking-tighter">
          K
        </span>
      </div>

      {/* Sticky Floating Glass Navigation with Cloud Sync & Auth controls */}
      <HeaderNav />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <HomeView onOpenOnboarding={() => setIsOnboardingOpen(true)} />
        )}
        {currentTab === 'desempenho' && <PerformanceDashboard />}
        {currentTab === 'rotina' && <RoutineBuilder />}
        {currentTab === 'treino_vivo' && <LiveWorkout />}
        {currentTab === 'alimentacao' && <MealPlanner />}
        {currentTab === 'nutricao_guia' && <NutritionScience />}
        {currentTab === 'catalogo' && <FoodCatalog />}
        {currentTab === 'compras' && <ShoppingList />}
        {currentTab === 'suplementacao' && <SupplementsGuide />}
        {currentTab === 'evolucao' && <EvolutionTracker />}
        {currentTab === 'calendario' && <WeeklyCalendar />}
      </main>

      {/* Onboarding Questionnaire Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Whitelist Manager Modal for owner */}
      <WhitelistModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
