"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import WalletButton from "@/components/WalletButton";
import { getCreatorById, getCreatorByWallet } from "@/lib/creators";
import { API_URL } from "@/lib/config";

interface OverviewStats {
  total_tips_sent: number;
  total_sol_tipped: number;
  total_cashback_earned: number;
  creators_supported: number;
}

interface CreatorStats {
  creator_wallet: string;
  tip_count: number;
  total_amount: number;
  last_tip_timestamp: number;
  next_reward_progress: number;
  tips_until_reward: number;
  rewards_earned: number;
}

interface RecentTip {
  id: number;
  supporter_wallet: string;
  creator_wallet: string;
  amount_sol: number;
  timestamp: number;
  tx_signature: string;
}

interface RewardHistory {
  id: number;
  supporter_wallet: string;
  creator_wallet: string;
  supporter_amount_sol: number;
  creator_amount_sol: number;
  total_tips_amount_sol: number;
  tx_signature: string;
  timestamp: number;
}

interface DashboardData {
  overview: OverviewStats;
  creators: CreatorStats[];
  recent_tips: RecentTip[];
  reward_history: RewardHistory[];
}

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/supporter/${publicKey.toString()}`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">supporter dashboard</h1>
            <p className="text-gray-600 mb-6">connect your wallet to view your stats</p>
            <WalletButton />
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-600">loading your stats...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-red-600">failed to load dashboard data</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">supporter dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">total tips sent</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.total_tips_sent}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">total SOL tipped</p>
            <p className="text-3xl font-bold text-purple-600">{data.overview.total_sol_tipped.toFixed(4)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg border-2 border-green-300 p-6 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-4xl opacity-20">💰</div>
            <div className="absolute bottom-1 right-1 text-2xl opacity-10">🪙</div>
            <p className="text-sm text-green-700 font-medium mb-1">cashback earned</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <p className="text-3xl font-bold text-green-600">{data.overview.total_cashback_earned.toFixed(4)}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">creators supported</p>
            <p className="text-3xl font-bold text-gray-900">{data.overview.creators_supported}</p>
          </div>
        </div>

        {/* Creators Supported */}
        {data.creators.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">creators you support</h2>
            <div className="space-y-4">
              {data.creators.map((creator) => {
                const creatorInfo = getCreatorByWallet(creator.creator_wallet);
                return (
                  <div key={creator.creator_wallet} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {creatorInfo?.name || `${creator.creator_wallet.slice(0, 8)}...`}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {creator.creator_wallet.slice(0, 16)}...
                        </p>
                      </div>
                      <Link
                        href={`/creator/${creatorInfo?.id || creator.creator_wallet}`}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        visit profile →
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">tips sent</p>
                        <p className="text-lg font-semibold text-gray-900">{creator.tip_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">total amount</p>
                        <p className="text-lg font-semibold text-purple-600">{creator.total_amount.toFixed(4)} SOL</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">cashback earned</p>
                        <p className="text-lg font-semibold text-green-600">{creator.rewards_earned.toFixed(4)} SOL</p>
                      </div>
                    </div>

                    {/* Progress to next reward */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-700 font-medium">
                          {creator.tips_until_reward === 0
                            ? "reward available on next tip!"
                            : `${creator.tips_until_reward} more tip${creator.tips_until_reward > 1 ? "s" : ""} until reward`}
                        </p>
                        <p className="text-sm text-gray-600">{creator.next_reward_progress}/3</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${(creator.next_reward_progress / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reward History */}
        {data.reward_history.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">reward history</h2>
            <div className="space-y-3">
              {data.reward_history.map((reward) => (
                <div key={reward.id} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      +{reward.supporter_amount_sol.toFixed(4)} SOL cashback
                    </p>
                    <p className="text-xs text-green-700">
                      from {reward.total_tips_amount_sol.toFixed(4)} SOL in tips
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(reward.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${reward.tx_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline"
                  >
                    view tx →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {data.recent_tips.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">recent tips</h2>
            <div className="space-y-3">
              {data.recent_tips.map((tip) => (
                <div key={tip.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tip.amount_sol.toFixed(4)} SOL</p>
                    <p className="text-xs text-gray-600">
                      {new Date(tip.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://explorer.solana.com/tx/${tip.tx_signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline"
                  >
                    view tx →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.creators.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">you haven't supported any creators yet</p>
            <Link
              href="/"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
            >
              discover creators
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
