"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "./components/Header";
import { Toaster } from "sonner"; // Notification container

// Dynamic Imports
const CrashGame = dynamic(
  async () => (await import("./components/CrashGame")).CrashGame,
  { ssr: false }
);

const ReclaimerDashboard = dynamic(
  async () => (await import("./components/ReclaimerDashboard")).ReclaimerDashboard,
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<'reclaimer' | 'game'>('reclaimer');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0f1016]"></div>;

  return (
    <main className="min-h-screen bg-[#0f1016] text-white font-sans overflow-x-hidden">
      <Toaster position="bottom-center" theme="dark" />
      
      <div className="max-w-4xl mx-auto p-5 md:p-10 flex flex-col gap-8">
        
        {/* New Enterprise Header */}
        <Header />

        {/* Navigation */}
        <div className="flex gap-4 border-b border-slate-800 pb-1">
          <button 
            onClick={() => setCurrentView('reclaimer')}
            className={`pb-3 px-2 font-bold transition-colors ${currentView === 'reclaimer' ? 'text-[#14F195] border-b-2 border-[#14F195]' : 'text-slate-500 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('game')}
            className={`pb-3 px-2 font-bold transition-colors ${currentView === 'game' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-white'}`}
          >
            Crash Game
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-[400px]">
          {currentView === 'reclaimer' ? <ReclaimerDashboard /> : <CrashGame />}
        </div>

      </div>
    </main>
  );
}