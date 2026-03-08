import { useState } from 'react';
// Landing Page Components
import LandingPage from './components/landing/LandingPage';
// Original App Components
import Header from './components/Header';
import Hero from './components/Hero';
import PromptTool from './components/PromptTool';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import HistorySection from './components/HistorySection';
import RewardedModal from './components/RewardedModal';
import ToastContainer from './components/ToastContainer';
import Background from './components/ui/Background';
import { AdsProvider } from './contexts/AdsContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';

// Toggle between landing page and original app
const USE_LANDING_PAGE = true;

function AppContent() {
  if (USE_LANDING_PAGE) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background-base dark:bg-background-base">
      <Background />

      <div className="relative z-10">
        <Header />

        <main className="container">
          <Hero />
          <PromptTool />
          <CTASection />
        </main>

        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdsProvider>
          <AppContent />
          <ToastContainer />
          <RewardedModal />
        </AdsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
