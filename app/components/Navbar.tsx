import React from 'react';

type ViewType = 'reclaimer' | 'game';

interface NavbarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

export const Navbar = ({ currentView, setView }: NavbarProps) => {
  return (
    <div className="flex justify-center mb-8 relative z-40">
      <div className="bg-[#1a1b2e] p-1.5 rounded-xl flex gap-2 border border-[#3e405a] shadow-inner">
        <button
          onClick={() => {
            console.log("Switching to Reclaimer");
            setView('reclaimer');
          }}
          className={`cursor-pointer relative z-50 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            currentView === 'reclaimer'
              ? 'bg-[#9945FF] text-white shadow-lg shadow-purple-500/20'
              : 'text-gray-400 hover:text-white hover:bg-[#2a2b3d]'
          }`}
        >
          Sol Reclaimer
        </button>
        <button
          onClick={() => {
            console.log("Switching to Game");
            setView('game');
          }}
          className={`cursor-pointer relative z-50 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
            currentView === 'game'
              ? 'bg-[#14F195] text-black shadow-lg shadow-green-500/20'
              : 'text-gray-400 hover:text-white hover:bg-[#2a2b3d]'
          }`}
        >
          Play & Earn
        </button>
      </div>
    </div>
  );
};