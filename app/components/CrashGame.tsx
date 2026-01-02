"use client";

import { useGambaPlay } from 'gamba-react-v2';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, Coins, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const CrashGame = () => {
  const gamba = useGambaPlay() as any;
  const { connected } = useWallet();
  const [wager, setWager] = useState(0.01);
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');

  const handlePlay = async () => {
    // 1. Connection Check
    if (!connected) {
      return toast.error("Please connect your wallet first!");
    }
    
    // 2. Engine Check (Run this ON CLICK, not as a disabled state)
    // The console shows 'gamba.play' exists, so this should pass.
    if (!gamba || typeof gamba.play !== 'function') {
      console.error("Gamba Engine failed to load:", gamba);
      return toast.error("Game engine not ready", { 
        description: "Please refresh the page or check your connection." 
      });
    }

    setGameState('PLAYING');
    setMultiplier(1.00);

    try {
      const wagerLamports = Math.floor(wager * 1_000_000_000);
      
      const res = await gamba.play({
        wager: wagerLamports,
        bet: [2, 0], // Double or Nothing
      });
      
      console.log("Tx Sent:", res);

      // Simulation Logic
      let m = 1.0;
      const interval = setInterval(() => {
        m += 0.05;
        setMultiplier(parseFloat(m.toFixed(2)));
        if (m >= 2.0) {
          clearInterval(interval);
          setGameState('WON');
          toast.success("ROCKET LANDED! 🚀", { description: "You doubled your SOL!" });
        }
      }, 50);

    } catch (error: any) {
      console.error("Game Error:", error);
      setGameState('IDLE');
      
      if (error?.message?.includes("User rejected")) {
        toast.info("Transaction cancelled");
      } else {
        toast.error("Transaction Failed", { description: "Check console for details." });
      }
    }
  };

  return (
    <div className="bg-[#213743] p-8 rounded-2xl border-2 border-slate-700 flex flex-col items-center gap-6 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />

      <div className="w-full flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
        <span>Solana Crash</span>
        <span className={`flex items-center gap-2 ${connected ? "text-[#14F195]" : "text-red-400"}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-[#14F195]" : "bg-red-400 animate-pulse"}`} />
          {connected ? "Online" : "Offline"}
        </span>
      </div>

      <div className="relative w-64 h-64 bg-[#0f212e] rounded-full border-4 border-[#2a2b3d] flex items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
        <div className={`text-6xl font-black transition-colors duration-300 ${gameState === 'WON' ? 'text-[#14F195]' : 'text-white'}`}>
          {multiplier.toFixed(2)}x
        </div>
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-10 text-purple-400 animate-bounce flex items-center gap-2 font-bold text-sm">
            <Rocket className="w-4 h-4" /> IN FLIGHT
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-bold ml-1 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Wager (SOL)
          </label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={wager}
              onChange={(e) => setWager(Number(e.target.value))}
              disabled={gameState === 'PLAYING'}
              className="flex-1 bg-[#0f212e] border border-slate-600 rounded-lg p-3 text-white font-bold focus:border-purple-500 outline-none transition-colors"
              step="0.01"
              min="0.001"
            />
            <button onClick={() => setWager(w => parseFloat((w/2).toFixed(3)))} className="px-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-slate-300">½</button>
            <button onClick={() => setWager(w => parseFloat((w*2).toFixed(3)))} className="px-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-slate-300">2x</button>
          </div>
        </div>

        {/* FIX: Removed '!isEngineReady' from disabled logic so the button is always active */}
        <button 
          onClick={handlePlay}
          disabled={!connected || gameState === 'PLAYING'}
          className={`w-full py-4 font-black text-lg rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
            ${!connected 
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : gameState === 'PLAYING'
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110 hover:shadow-purple-500/50'
            }`}
        >
          {gameState === 'PLAYING' ? (
            <>Launching <Rocket className="w-5 h-5 animate-pulse" /></>
          ) : 'PLACE BET'}
        </button>
      </div>
    </div>
  );
};