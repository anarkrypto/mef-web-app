'use client';

import {
  Wallet,
  LogOut,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

export type IconKey = keyof typeof Icons;

export const Icons: Record<string, LucideIcon> = {
  wallet: Wallet,
  logout: LogOut,
  spinner: Loader2,
}; 