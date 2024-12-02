"use client"

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import type { WalletProvider } from '@/types/wallet';

interface WalletOption {
  id: WalletProvider;
  name: string;
  logo: string;
  description: string;
  disabled?: boolean;
}

const WALLET_OPTIONS: readonly WalletOption[] = [
  {
    id: 'auro',
    name: 'Auro Wallet',
    logo: '/wallets/auro.jpeg',
    description: 'Connect using Auro Wallet',
    disabled: false,
  },
  {
    id: 'pallard',
    name: 'Pallard',
    logo: '/wallets/pallard.png',
    description: 'Connect using Pallard (Coming Soon)',
    disabled: true,
  },
  {
    id: 'clorio',
    name: 'Clorio',
    logo: '/wallets/clorio.png',
    description: 'Connect using Clorio (Coming Soon)',
    disabled: true,
  },
] as const;

interface WalletConnectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectorDialog({ open, onOpenChange }: WalletConnectorDialogProps) {
  const { connect } = useWallet();
  const [detectedWallets, setDetectedWallets] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkWallets = () => {
      setDetectedWallets({
        auro: typeof window !== 'undefined' && 'mina' in window,
        pallard: false,
        clorio: false,
      });
    };

    checkWallets();
    window.addEventListener('focus', checkWallets);
    return () => window.removeEventListener('focus', checkWallets);
  }, []);

  const handleConnect = async (providerId: WalletProvider) => {
    try {
      setIsConnecting(true);
      await connect(providerId);
      onOpenChange(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="border-b pb-4 relative">
          <DialogTitle className="text-2xl font-bold pr-8">
            Connect a wallet to continue
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors absolute top-0 right-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5 text-red-600" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl">Ⓜ️</span>
            </div>
            <span className="text-2xl font-semibold">🅼 🅴 🅵</span>
          </div>
        </div>
        <div className="space-y-4">
          {WALLET_OPTIONS.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="w-full justify-between h-auto py-4 px-4 hover:bg-gray-50 transition-colors"
              disabled={isConnecting || wallet.disabled}
              onClick={() => handleConnect(wallet.id)}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={wallet.logo}
                  alt={`${wallet.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <span className="text-xl font-semibold">{wallet.name}</span>
              </div>
              {wallet.disabled ? (
                <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-800">
                  Coming Soon
                </Badge>
              ) : detectedWallets[wallet.id] ? (
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                  Detected
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-800">
                  Not Detected
                </Badge>
              )}
              {isConnecting && wallet.id === 'auro' && (
                <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 