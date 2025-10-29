export interface Creator {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  goal?: string;
  avatar?: string;
}

export const creators: Creator[] = [
  {
    id: "alice-dev",
    name: "alice.sol",
    description:
      "building open source tools for solana developers. contributions keep the code flowing.",
    walletAddress: "8ExDW5iZXCs5R6MHQuHksDLtXZT7qYUj6Yq8tdGSdGJk",
    goal: "funding next major release",
    avatar: "🧑‍💻",
  },
  {
    id: "bob-creator",
    name: "bob creates",
    description:
      "creating educational content about web3 and solana ecosystem. tips help me create more tutorials.",
    walletAddress: "3UTbbRMJSq4LxQ6iCwdT7dzdRShqYAMy9bnrKgdZecef",
    goal: "new video series on solana programs",
    avatar: "🎬",
  },
  {
    id: "carol-artist",
    name: "carol.art",
    description:
      "solana nft artist. creating generative art on-chain. support helps me mint more collections.",
    walletAddress: "C92g4XZ7A4mYa4e9Bc4HNSLZV6rTo5wGh34mdwyecSDL",
    goal: "funding next collection drop",
    avatar: "🎨",
  },
  {
    id: "dave-music",
    name: "dave.sounds",
    description:
      "making music nfts and experimenting with on-chain audio. tips go towards better equipment.",
    walletAddress: "pW1nDPAbTX9iqrzE2s1f9hRRemXBzfLTUPBL2i3nui4",
    goal: "new studio setup",
    avatar: "🎵",
  },
];

export function getCreatorById(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

export function getCreatorByWallet(walletAddress: string): Creator | undefined {
  return creators.find((c) => c.walletAddress === walletAddress);
}
