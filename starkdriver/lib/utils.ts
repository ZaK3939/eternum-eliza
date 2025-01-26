import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function round(value: number, decimals: number) {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
}