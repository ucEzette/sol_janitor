"use client";

import { useGambaPlay } from 'gamba-react-v2';
import { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Rocket, Coins, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { calculateBetArray, calculateBiasedLowMultiplier } from '../utils/crashMath';

export const CrashGame = () => {
  const play = useGambaPlay() as any;
  const { connected } = useWallet();
  
  // Game State
  const [wager, setWager] = useState(0.05);
  const [targetMultiplier, setTargetMultiplier] = useState(2.00);
  const [currentDisplay, setCurrentDisplay] = useState(1.00);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON' | 'LOST'>('IDLE');
  
  // Animation Ref
  const animationRef = useRef<NodeJS.Timeout>();

  const handlePlay = async () => {
    if (!connected) return toast.error("Connect Wallet to Play");
    if (gameState === 'PLAYING') return;

    setGameState('PLAYING');
    setCurrentDisplay(1.00);

    try {
      const wagerLamports = Math.floor(wager * 1_000_000_000);
      const betConfiguration = calculateBetArray(targetMultiplier);

      // 1. Send Transaction to Blockchain
      const response = await play({
        wager: wagerLamports,
        bet: betConfiguration,
      });

      console.log("Tx Sent:", response);

      // 2. Await the verifiable result from the chain
      // This ensures we show the REAL outcome, not a simulation.
      const result = await response.result();
      const didWin = result.payout > 0;

      // 3. Determine where the rocket stops
      // If win: Stop exactly at target.
      // If loss: Stop at a random lower number (calculated bias).
      const crashPoint = didWin 
        ? targetMultiplier 
        : calculateBiasedLowMultiplier(targetMultiplier);

      // 4. Run Animation to that point
      animateToResult(crashPoint, didWin);

    } catch (error: any) {
      console.error("Game Error:", error);
      setGameState('IDLE');
      if (error?.message?.includes("User rejected")) {
        toast.info("Transaction cancelled");
      } else {
        toast.error("Transaction Failed", { description: "Check balance or connection." });
      }
    }
  };

  const animateToResult = (target: number, isWin: boolean) => {
    let current = 1.00;
    const speed = 50; // ms

    if (animationRef.current) clearInterval(animationRef.current);

    animationRef.current = setInterval(() => {
      // Exponential growth curve for realistic feel
      const growth = 0.01 + (current * 0.02); 
      current += growth;

      if (current >= target) {
        clearInterval(animationRef.current);
        setCurrentDisplay(target);
        setGameState(isWin ? 'WON' : 'LOST');
        
        if (isWin) {
          toast.success(`CASHED OUT: ${target.toFixed(2)}x!`, { 
            description: `You won ${(wager * target).toFixed(3)} SOL` 
          });
        } else {
          toast.error(`CRASHED AT ${target.toFixed(2)}x`);
        }
      } else {
        setCurrentDisplay(current);
      }
    }, speed);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] w-full max-w-6xl mx-auto">
      
      {/* LEFT: CONTROLS */}
      <div className="lg:col-span-4 bg-[#1a2c38] rounded-2xl p-6 flex flex-col gap-6 shadow-2xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9945FF] to-[#14F195]"/>
        
        {/* Wager Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Coins className="w-4 h-4" /> Wager (SOL)
          </label>
          <div className="relative">
            <input 
              type="number" 
              value={wager} 
              onChange={(e) => setWager(Number(e.target.value))}
              disabled={gameState === 'PLAYING'}
              className="w-full bg-[#0f212e] border border-slate-600 rounded-xl py-4 pl-4 pr-20 text-white font-mono font-bold text-lg focus:border-[#14F195] outline-none transition-colors"
              step="0.05"
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <button onClick={() => setWager(w => parseFloat((w/2).toFixed(3)))} className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-slate-300">½</button>
              <button onClick={() => setWager(w => parseFloat((w*2).toFixed(3)))} className="px-2 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold text-slate-300">2x</button>
            </div>
          </div>
        </div>

        {/* Multiplier Slider */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" /> Target Payout
              </label>
              <span className="text-[#14F195] font-bold text-xl">{targetMultiplier.toFixed(2)}x</span>
           </div>
           <input 
             type="range" 
             min="1.1" 
             max="10" 
             step="0.1"
             value={targetMultiplier}
             onChange={(e) => setTargetMultiplier(Number(e.target.value))}
             disabled={gameState === 'PLAYING'}
             className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#14F195]"
           />
           <div className="flex justify-between text-xs text-slate-500 font-mono">
             <span>1.10x</span>
             <span>5.00x</span>
             <span>10.00x</span>
           </div>
        </div>

        {/* Profit Info */}
        <div className="bg-[#0f212e]/50 p-4 rounded-xl border border-slate-700/50 space-y-2 mt-auto">
           <div className="flex justify-between text-sm">
             <span className="text-slate-400">Potential Profit</span>
             <span className="text-[#14F195] font-bold">+{(wager * targetMultiplier - wager).toFixed(4)} SOL</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-slate-400">Win Chance</span>
             <span className="text-purple-400 font-bold">{(1 / targetMultiplier * 99).toFixed(1)}%</span>
           </div>
        </div>

        <button 
          onClick={handlePlay} 
          disabled={!connected || gameState === 'PLAYING'}
          className={`w-full py-5 rounded-xl font-black text-xl tracking-wide uppercase transition-all shadow-lg hover:-translate-y-1 active:scale-95
            ${!connected 
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
              : gameState === 'PLAYING'
                ? 'bg-slate-700 text-slate-500 cursor-wait'
                : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black shadow-[#14F195]/20'
            }`}
        >
          {gameState === 'PLAYING' ? 'Rocket Launched...' : 'Place Bet'}
        </button>
      </div>

      {/* RIGHT: GAME STAGE */}
      <div className="lg:col-span-8 bg-[#0f212e] rounded-2xl border-4 border-[#1a2c38] relative flex flex-col justify-center items-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#2a4055 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Central Counter */}
        <div className="relative z-10 text-center">
          <div className={`text-8xl lg:text-9xl font-black tracking-tighter tabular-nums drop-shadow-2xl transition-all duration-100
            ${gameState === 'WON' ? 'text-[#14F195] scale-110' : gameState === 'LOST' ? 'text-red-500' : 'text-white'}
          `}>
            {currentDisplay.toFixed(2)}x
          </div>
          
          {gameState === 'PLAYING' && (
            <div className="mt-8 flex items-center justify-center gap-3 text-purple-400 animate-pulse">
              <Rocket className="w-8 h-8 transform -rotate-45" />
              <span className="font-bold text-xl tracking-widest">FLYING UP</span>
            </div>
          )}
          
          {gameState === 'WON' && <div className="mt-4 text-[#14F195] font-bold text-2xl tracking-widest">WINNER</div>}
          {gameState === 'LOST' && <div className="mt-4 text-red-500 font-bold text-2xl tracking-widest">CRASHED</div>}
        </div>
      </div>
    </div>
  );
};