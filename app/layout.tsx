import type { Metadata } from "next";
import "./globals.css";
import WalletContextProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "0xTip - Support Creators",
  description: "Support your favorite creators with Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
