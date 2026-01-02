"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { GambaProvider } from "gamba-react-v2";
import "@solana/wallet-adapter-react-ui/styles.css";

// Fix: Cast GambaProvider to any to suppress TypeScript prop errors
const GambaProviderAny = GambaProvider as any;

interface Props {
  children: React.ReactNode;
  creator: string;
}

export default function ClientProviders({ children, creator }: Props) {
  const network = WalletAdapterNetwork.Mainnet;
  
  // Use a reliable RPC endpoint
  const endpoint = useMemo(
    () => "https://mainnet.helius-rpc.com/?api-key=4d79e503-d315-4dcf-89a5-e07d67543e3b",
    []
  );

  // FIX: Leave this array EMPTY. 
  // Modern wallets (Phantom, Solflare) are auto-detected by the "Standard Wallet" protocol.
  // Adding them manually causes the "Registered as Standard Wallet" warning in your logs.
  const wallets = useMemo(() => [], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <GambaProviderAny
            creator={creator} 
            fees={{
              creator: 0.05,
              jackpot: 0.01,
            }}
          >
            {children}
          </GambaProviderAny>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}