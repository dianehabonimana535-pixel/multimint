import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatBnb(wei: bigint): string {
  const bnb = Number(wei) / 1e18;
  return bnb.toFixed(5).replace(/0+$/, "").replace(/\.$/, "");
}
