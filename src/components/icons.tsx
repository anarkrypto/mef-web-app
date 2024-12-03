'use client';

import {
  Wallet,
  LogOut,
  Loader2,
  type Icon as LucideIcon,
} from 'lucide-react';

export type Icon = typeof LucideIcon;

export const Icons = {
  wallet: Wallet,
  logout: LogOut,
  spinner: Loader2,
} as const; 