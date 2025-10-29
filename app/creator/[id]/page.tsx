import { notFound } from "next/navigation";
import { getCreatorById } from "@/lib/creators";
import Header from "@/components/Header";
import TipButton from "@/components/TipButton";
import SupporterList from "@/components/SupporterList";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const creator = getCreatorById(id);

  if (!creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} showDashboardLink={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{creator.avatar}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {creator.name}
              </h1>
              <p className="text-gray-600 mb-4">{creator.description}</p>
              {creator.goal && (
                <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                  <span className="font-semibold">goal:</span> {creator.goal}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">wallet address</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {creator.walletAddress}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TipButton
            creatorWallet={creator.walletAddress}
            creatorName={creator.name}
          />
          <SupporterList creatorWallet={creator.walletAddress} />
        </div>
      </main>
    </div>
  );
}
