import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AiDemoTerminal from './components/AiDemoTerminal';
import PaywallModal from './components/PaywallModal';
import ProtocolFlow from './components/ProtocolFlow';
import PrivacyComparison from './components/PrivacyComparison';
import CodeIntegration from './components/CodeIntegration';
import Footer from './components/Footer';

export default function App() {
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionId, setSessionId] = useState('sess_9e14a8f9c');
  const [activeQueryPrompt, setActiveQueryPrompt] = useState('');

  // Triggered when user attempts to submit prompt or clicks unlock button in AI demo
  const handleTriggerPaywall = (query) => {
    setActiveQueryPrompt(query || 'Confidential AI query');
    // Generate an ephemeral cryptographic session token
    const randomHex = Math.random().toString(16).substring(2, 10);
    setSessionId(`sess_${randomHex}`);
    setIsPaywallOpen(true);
  };

  // Called when user simulates payment or mempool confirms payment
  const handlePaymentSuccess = () => {
    setIsPaywallOpen(false);
    setIsUnlocked(true);
    scrollToDemo();
  };

  const scrollToDemo = () => {
    const demoElement = document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-cloak-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navbar */}
      <Navbar onOpenDemo={() => handleTriggerPaywall()} />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero onExploreDemo={scrollToDemo} />

        {/* Live Interactive AI Assistant Demo Card with HTTP 402 Paywall */}
        <AiDemoTerminal 
          onTriggerPaywall={handleTriggerPaywall}
          isUnlocked={isUnlocked}
          unlockedSessionId={sessionId}
        />

        {/* Protocol Step-by-Step Architecture */}
        <ProtocolFlow />

        {/* Privacy Comparison Matrix (CloakPay vs Stripe vs Lightning vs WalletConnect) */}
        <PrivacyComparison />

        {/* Developer Integration Code Showcase */}
        <CodeIntegration />
      </main>

      {/* Paywall Modal Dialog */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        sessionId={sessionId}
        queryPrompt={activeQueryPrompt}
      />

      {/* Footer */}
      <Footer onOpenDemo={() => handleTriggerPaywall()} />
    </div>
  );
}

