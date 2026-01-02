"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { GambaProvider } from "gamba-react-v2";
import { PublicKey } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const GambaProviderAny = GambaProvider as any;

interface Props {
  children: React.ReactNode;
  creator: string; // This is YOUR wallet address
}

export default function ClientProviders({ children, creator }: Props) {
  // Use Helius for reliable performance (Production RPC)
  const endpoint = useMemo(() => "https://mainnet.helius-rpc.com/?api-key=4d79e503-d315-4dcf-89a5-e07d67543e3b", []);
  
  // Empty wallets array enables auto-detection for Phantom/Solflare
  const wallets = useMemo(() => [], []);

  // Safety check to prevent crashes
  const isValidCreator = useMemo(() => {
    try {
      new PublicKey(creator);
      return true;
    } catch (e) {
      return false;
    }
  }, [creator]);

  if (!isValidCreator) return <div className="text-red-500 p-10">Invalid Creator Address</div>;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <GambaProviderAny
            creator={creator} 
            // 💰 REVENUE CONFIGURATION 💰
            fees={{
              creator: 0.05, // You earn 5% of every bet
              jackpot: 0.01, // 1% goes to the Gamba Jackpot (optional)
            }}
          >
            {children}
          </GambaProviderAny>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}