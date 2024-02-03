import { clsx, type ClassValue } from "clsx";
import { createTwc } from "react-twc";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// https://react-twc.vercel.app/docs/guides/class-name-prop
export const twx = createTwc({ compose: cn });
