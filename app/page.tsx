import Link from "next/link";
import { creators } from "@/lib/creators";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header showDashboardLink={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            An Onchain Tipping Platform With Rewards
          </h2>
          <p className="text-lg text-gray-600">For Creators And Supporters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creator/${creator.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{creator.avatar}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {creator.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {creator.description}
                  </p>
                  {creator.goal && (
                    <div className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                      {creator.goal}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
