'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { WalletContextType, WalletProvider, WalletState } from '@/types/wallet';

const initialState: WalletState = {
  status: 'disconnected',
  wallet: null,
  error: null,
  lastConnected: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface AccountsChangedEvent extends Event {
  detail: {
    accounts: string[];
  };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(initialState);
  const { toast } = useToast();

  const connect = async (provider: WalletProvider) => {
    try {
      setState(prev => ({ ...prev, status: 'connecting' }));

      if (provider === 'auro') {
        if (!window.mina) {
          throw new Error('Auro wallet is not installed');
        }

        const accounts = await window.mina.requestAccounts();
        
        if (!accounts[0]) {
          throw new Error('No accounts found');
        }

        const network = await window.mina.requestNetwork?.().catch(() => null);

        setState({
          status: 'connected',
          wallet: {
            address: accounts[0],
            provider: 'auro',
            publicKey: accounts[0],
            network: network?.networkID || null,
          },
          error: null,
          lastConnected: new Date(),
        });

        toast({
          title: '✅ Wallet Connected',
          description: `Successfully connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      } else {
        throw new Error('Provider not supported yet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error && typeof error === 'object' && 'code' in error) {
        switch ((error as { code: number }).code) {
          case 1002:
            errorMessage = 'Connection request was rejected';
            break;
          case 20001:
            errorMessage = 'No account found in wallet';
            break;
          case 23001:
            errorMessage = 'Origin mismatch - security error';
            break;
          default:
            errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
        }
      }

      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      toast({
        title: '❌ Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const disconnect = useCallback(async () => {
    try {
      setState(initialState);
      toast({
        title: '👋 Wallet Disconnected',
        description: 'Successfully disconnected wallet',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet';
      toast({
        title: '❌ Disconnect Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.mina) {
        try {
          const accounts = await window.mina.getAccounts?.() || [];
          if (accounts[0]) {
            const network = await window.mina.requestNetwork?.().catch(() => null);
            setState({
              status: 'connected',
              wallet: {
                address: accounts[0],
                provider: 'auro',
                publicKey: accounts[0],
                network: network?.networkID || null,
              },
              error: null,
              lastConnected: new Date(),
            });
          }
        } catch (error) {
          console.error('Failed to restore wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    const mina = window.mina;
    if (!mina) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts[0]) {
        disconnect();
      } else if (state.wallet?.address !== accounts[0]) {
        setState(prev => ({
          ...prev,
          wallet: prev.wallet ? {
            ...prev.wallet,
            address: accounts[0],
            publicKey: accounts[0],
          } : null,
        }));
      }
    };

    if (mina.on) {
      mina.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (mina.removeListener) {
        mina.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [state.wallet?.address, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        state,
        connect,
        disconnect,
        isConnected: state.status === 'connected',
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 