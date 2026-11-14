import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AiDemoTerminal from './components/AiDemoTerminal';
import PaywallModal from './components/PaywallModal';
import ProtocolFlow from './components/ProtocolFlow';
import PrivacyComparison from './components/PrivacyComparison';
import CodeIntegration from './components/CodeIntegration';
import Footer from './components/Footer';

export default function App() {
  const [isPaywallOpen, setIsPaywallOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('modal'));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('session');
      if (param) return param;
    }
    return 'sess_9e14a8f9c';
  });
  const [activeQueryPrompt, setActiveQueryPrompt] = useState('');
  const [backendHealth, setBackendHealth] = useState({
    checked: false,
    online: false,
    network: 'Zcash Testnet',
    scannerReady: false,
    currentHeight: 0,
    merchantAddress: null,
  });

  // Query live backend health & scanner readiness
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('Health check non-200');
        const data = await res.json();
        if (isMounted) {
          setBackendHealth({
            checked: true,
            online: true,
            network: data.network || 'Zcash Testnet',
            scannerReady: !!data.scanner?.ready,
            currentHeight: data.scanner?.currentHeight || 0,
            merchantAddress: data.merchantAddress,
          });
        }
      } catch (err) {
        if (isMounted) {
          setBackendHealth({
            checked: true,
            online: false,
            network: 'Zcash Testnet',
            scannerReady: false,
            currentHeight: 0,
            merchantAddress: null,
          });
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    const demoElement = document.getElementById('workbench') || document.getElementById('demo');
    if (demoElement) {
      demoElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-950">

      {/* Top Navbar */}
      <Navbar onOpenDemo={() => handleTriggerPaywall()} onScrollToWorkbench={scrollToDemo} />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero
          onExploreDemo={scrollToDemo}
          backendHealth={backendHealth}
          onOpenPaywall={() => handleTriggerPaywall()}
        />

        {/* Live Interactive API Payment Workbench */}
        <AiDemoTerminal
          onTriggerPaywall={handleTriggerPaywall}
          isUnlocked={isUnlocked}
          unlockedSessionId={sessionId}
          backendHealth={backendHealth}
        />

        {/* Protocol Step-by-Step Architecture */}
        <ProtocolFlow />

        {/* Privacy Comparison Matrix (CloakPay vs Traditional vs Lightning vs Public On-Chain) */}
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

