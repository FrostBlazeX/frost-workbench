import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names, then let tailwind-merge resolve conflicts so the last one wins.
 * cn("px-4", condition && "px-2") → "px-2", not "px-4 px-2".
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
