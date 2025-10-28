"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface Supporter {
  address: string;
  amount: number;
  signature: string;
  timestamp: number;
}

interface SupporterListProps {
  creatorWallet: string;
}

export default function SupporterList({ creatorWallet }: SupporterListProps) {
  const { connection } = useConnection();
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const publicKey = new PublicKey(creatorWallet);
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });

        const supporterData: Supporter[] = [];

        for (const sig of signatures) {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });

          if (!tx || !tx.meta) continue;

          const instructions = tx.transaction.message.instructions;
          for (const instruction of instructions) {
            if ("parsed" in instruction && instruction.parsed.type === "transfer") {
              const info = instruction.parsed.info;
              if (info.destination === creatorWallet) {
                supporterData.push({
                  address: info.source,
                  amount: info.lamports / LAMPORTS_PER_SOL,
                  signature: sig.signature,
                  timestamp: tx.blockTime || 0,
                });
              }
            }
          }
        }

        setSupporters(supporterData);
      } catch (error) {
        console.error("failed to fetch supporters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporters();
  }, [creatorWallet, connection]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">recent supporters</h3>
        <p className="text-gray-500 text-sm">loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">recent supporters</h3>

      {supporters.length === 0 ? (
        <p className="text-gray-500 text-sm">no tips yet. be the first!</p>
      ) : (
        <div className="space-y-3">
          {supporters.map((supporter, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-mono text-gray-600">
                  {supporter.address.slice(0, 4)}...{supporter.address.slice(-4)}
                </p>
                {supporter.timestamp > 0 && (
                  <p className="text-xs text-gray-400">
                    {new Date(supporter.timestamp * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-600">
                  {supporter.amount} SOL
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${supporter.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  view
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
