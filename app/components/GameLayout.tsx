"use client";

import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LayoutDashboard, Gamepad2, Settings, History } from "lucide-react";

interface Props {
  children: React.ReactNode;
  currentView: string;
  setView: (view: any) => void;
}

export const GameLayout = ({ children, currentView, setView }: Props) => {
  const navItems = [
    { id: 'reclaimer', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'game', icon: Gamepad2, label: 'Crash' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0f212e] text-slate-200 font-sans selection:bg-purple-500/30">
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 border-r border-slate-800 flex-shrink-0 flex flex-col items-center lg:items-start py-6 bg-[#1a2c38]">
        <div className="px-6 mb-8 hidden lg:block">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent italic">
            JANITOR
          </h1>
        </div>
        
        <nav className="flex-1 w-full space-y-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? "bg-slate-700 text-white shadow-lg shadow-purple-500/10" 
                  : "hover:bg-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              <item.icon className={`w-6 h-6 ${currentView === item.id ? "text-purple-400" : "group-hover:text-purple-300"}`} />
              <span className="hidden lg:block font-bold tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-3 w-full mt-auto space-y-2">
           <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-center text-slate-500">
             <span className="hidden lg:inline">System Stable</span>
             <div className="w-2 h-2 bg-green-500 rounded-full inline-block ml-2 animate-pulse"/>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f212e]/95 backdrop-blur z-20">
          <div className="flex items-center gap-2">
             <History className="w-5 h-5 text-slate-500" />
             <span className="text-sm font-medium text-slate-400">Recent: </span>
             <div className="flex gap-2">
                {[2.1, 1.4, 8.5, 1.1].map((m, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded ${m >= 2 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {m}x
                  </span>
                ))}
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 rounded-full pl-4 pr-1 py-1 flex items-center border border-slate-700">
               <span className="text-sm font-bold text-slate-300 mr-3">0.00 SOL</span>
               <WalletMultiButton style={{ height: 32, fontSize: 12, borderRadius: 20 }} />
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};