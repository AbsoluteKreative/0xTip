"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
    </div>
  );
}
