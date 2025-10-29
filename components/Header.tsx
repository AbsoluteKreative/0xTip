import Link from "next/link";
import Image from "next/image";
import WalletButton from "@/components/WalletButton";

interface HeaderProps {
  showBackButton?: boolean;
  showDashboardLink?: boolean;
}

export default function Header({
  showBackButton = false,
  showDashboardLink = false,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            {showBackButton && <span className="text-xl text-gray-400">←</span>}
            <Image
              src="/logo.png"
              alt="0xTip"
              width={60}
              height={60}
              className="h-[60px] w-[60px]"
            />
          </Link>
          <div className="flex items-center gap-4">
            {showDashboardLink && (
              <Link
                href="/profile"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                My Dashboard
              </Link>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
