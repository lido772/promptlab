import { useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Footer from './Footer';
import Background from '../ui/Background';
import PromptTool from '../PromptTool';
import HistorySection from '../HistorySection';
import { useAuth } from '../../hooks/useAuth';

export default function LandingPage() {
  const { user } = useAuth();
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    // Show the full app experience
    return (
      <div className="min-h-screen bg-background-base">
        <Background />
        <div className="relative z-10">
          <Navbar onHomeClick={() => setShowApp(false)} />
          <main className="container">
            <div className="pt-8 lg:pt-12">
              <PromptTool />
            </div>
            {user && <HistorySection />}
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Show landing page with CTA
  return (
    <div className="min-h-screen bg-background-base">
      <Background />
      <div className="relative z-10">
        <Navbar onHomeClick={() => {}} />
        <main>
          <Hero onStartClick={() => setShowApp(true)} />
          <Features />
          <Pricing />
        </main>
        <Footer />
      </div>
    </div>
  );
}
