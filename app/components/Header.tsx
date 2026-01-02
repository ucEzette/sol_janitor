"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState, useCallback } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Loader2, Wallet, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error("Balance fetch error:", e);
      // Don't toast error on auto-fetch to avoid spam, only on manual refresh
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const handleRefresh = () => {
    fetchBalance();
    toast.success("Balance updated");
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#2a2b3d] pb-6 mb-8">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195]">
          Solana Janitor
        </h1>
        <p className="text-gray-400 text-sm mt-1">Enterprise Gaming & Tools</p>
      </div>

      <div className="flex items-center gap-4">
        {publicKey && (
          <div className="hidden md:flex items-center gap-3 bg-[#1a2c38] border border-slate-700 rounded-xl px-4 py-2 shadow-lg">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</span>
              <span className="text-sm font-mono font-bold text-[#14F195]">
                {balance !== null ? (
                  `${balance.toFixed(4)} SOL`
                ) : (
                  <span className="text-slate-500">---</span>
                )}
              </span>
            </div>
            
            <button 
              onClick={handleRefresh}
              className="p-1.5 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            </button>
            
            <div className="h-8 w-[1px] bg-slate-700 mx-1" />
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
        )}
        
        <div className="relative pointer-events-auto">
          <WalletMultiButton style={{ 
            backgroundColor: '#512da8', 
            height: '48px', 
            borderRadius: '12px',
            fontFamily: 'inherit',
            fontWeight: 'bold'
          }} />
        </div>
      </div>
    </header>
  );
};