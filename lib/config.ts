// platform config w/ env var fallbacks

// wallet that gets the 5% cut
export const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "3CDMm7U2iNF6WHU2TRoGbf29ajYgfch3qcYdtRbjJk5m";

// 0.05 = 5% to us, 95% to creator
export const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || "0.05");

// backend api endpoint
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
