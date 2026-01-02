"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

function encodeAmount(amount: number, decimals: number): Buffer {
  const rawAmount = BigInt(Math.round(amount * Math.pow(10, decimals)));
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(rawAmount);
  return buffer;
}

export const ReclaimerDashboard = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [emptyAccounts, setEmptyAccounts] = useState<any[]>([]);
  const [dustAccounts, setDustAccounts] = useState<any[]>([]);
  const [riskyAccounts, setRiskyAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const scanWallet = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setMsg("Scanning blockchain...");
    
    setEmptyAccounts([]);
    setDustAccounts([]);
    setRiskyAccounts([]);

    try {
      const response = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      const empty: any[] = [];
      const dust: any[] = [];
      const risky: any[] = [];

      response.value.forEach((item) => {
        const data = item.account.data.parsed.info;
        const amount = data.tokenAmount.uiAmount;
        const decimals = data.tokenAmount.decimals;
        const mint = data.mint;
        const delegate = data.delegate;
        const delegatedAmount = data.delegatedAmount?.uiAmount || 0;

        const accountObj = {
          pubkey: item.pubkey,
          mint: mint,
          amount: amount,
          decimals: decimals,
          delegate: delegate
        };

        if (amount === 0) {
          empty.push(accountObj);
        } else if (amount > 0 && amount < 0.01) {
          dust.push(accountObj);
        }

        if (delegate && delegatedAmount > 0) {
          risky.push({ ...accountObj, delegatedAmount });
        }
      });

      setEmptyAccounts(empty);
      setDustAccounts(dust);
      setRiskyAccounts(risky);
      setMsg(`Scan complete! Found ${empty.length} empty, ${dust.length} dust.`);
      
    } catch (error: any) {
      console.error("Scan error:", error);
      setMsg(`Error: ${error?.message || "Scan failed"}`);
    }
    setLoading(false);
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey) {
      scanWallet();
    } else {
      setMsg("Please connect your wallet.");
      setEmptyAccounts([]);
    }
  }, [publicKey, scanWallet]);

  const cleanEmpty = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const transaction = new Transaction();
      const batch = emptyAccounts.slice(0, 10);
      batch.forEach((acc) => {
        transaction.add(new TransactionInstruction({
          keys: [
            { pubkey: acc.pubkey, isSigner: false, isWritable: true },
            { pubkey: publicKey, isSigner: false, isWritable: true },
            { pubkey: publicKey, isSigner: true, isWritable: false }
          ],
          programId: TOKEN_PROGRAM_ID,
          data: Buffer.from([9]) 
        }));
      });
      await sendTransaction(transaction, connection);
      setMsg(`Success! Closed ${batch.length} accounts.`);
      scanWallet();
    } catch (error) {
      console.error(error);
      setMsg("Transaction failed.");
    }
    setLoading(false);
  };

  const burnAndClose = async (account: any) => {
    if (!publicKey || !confirm(`Burn ${account.amount} tokens?`)) return;
    setLoading(true);
    try {
      const transaction = new Transaction();
      const amountBuffer = encodeAmount(account.amount, account.decimals);
      
      transaction.add(new TransactionInstruction({
        keys: [
          { pubkey: account.pubkey, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(account.mint), isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false }
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.concat([Buffer.from([8]), amountBuffer]) 
      }));

      transaction.add(new TransactionInstruction({
        keys: [
          { pubkey: account.pubkey, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false }
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.from([9]) 
      }));

      await sendTransaction(transaction, connection);
      setMsg(`Burned & Closed!`);
      scanWallet();
    } catch (error) {
      console.error(error);
      setMsg("Transaction failed.");
    }
    setLoading(false);
  };

  const revokeAccess = async (account: any) => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const transaction = new Transaction();
      transaction.add(new TransactionInstruction({
        keys: [
          { pubkey: account.pubkey, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false }
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.from([13]) 
      }));
      await sendTransaction(transaction, connection);
      setMsg(`Revoked!`);
      scanWallet();
    } catch (error) {
      console.error(error);
      setMsg("Transaction failed.");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 relative z-10">
      <div className="bg-[#1a1b2e] p-6 rounded-xl border border-[#3e405a] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <p className="text-gray-300 font-medium text-sm">{msg}</p>
        <button
          onClick={scanWallet}
          disabled={!publicKey || loading}
          className="cursor-pointer relative z-20 px-6 py-2 bg-[#9945FF] hover:bg-[#8033dd] rounded-lg font-bold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Scanning..." : "Rescan Wallet"}
        </button>
      </div>

      {emptyAccounts.length > 0 && (
        <div className="flex justify-between items-center bg-[#13141f] p-4 rounded-xl border border-[#2a2b3d]">
          <h2 className="text-xl font-bold text-[#14F195]">🟢 Empty Accounts ({emptyAccounts.length})</h2>
          <button onClick={cleanEmpty} disabled={loading} className="cursor-pointer relative z-20 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-bold text-white active:scale-95">
            Claim ~{(emptyAccounts.length * 0.002).toFixed(3)} SOL
          </button>
        </div>
      )}

      {dustAccounts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-yellow-400">🟡 Dust Bin ({dustAccounts.length})</h2>
          {dustAccounts.map((acc, i) => (
            <div key={i} className="bg-[#13141f] p-4 rounded-xl border border-[#2a2b3d] flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-200">{acc.amount} tokens</p>
                <p className="text-xs text-gray-500 font-mono">...{acc.mint.slice(-6)}</p>
              </div>
              <button onClick={() => burnAndClose(acc)} disabled={loading} className="cursor-pointer relative z-20 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg text-xs font-bold active:scale-95">
                Burn & Claim
              </button>
            </div>
          ))}
        </div>
      )}
      
      {riskyAccounts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-red-500">🔴 Risks ({riskyAccounts.length})</h2>
          {riskyAccounts.map((acc, i) => (
            <div key={i} className="bg-[#13141f] p-4 rounded-xl border border-red-900 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-200">Delegate Access</p>
                <p className="text-xs text-red-400">Can spend {acc.delegatedAmount}</p>
              </div>
              <button onClick={() => revokeAccess(acc)} disabled={loading} className="cursor-pointer relative z-20 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold active:scale-95">
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};