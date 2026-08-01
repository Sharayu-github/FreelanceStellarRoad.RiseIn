import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isConnected, getPublicKey, requestAccess } from '@stellar/freighter-api';

interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      const connected = await isConnected();
      if (connected) {
        const pubKey = await getPublicKey();
        setPublicKey(pubKey);
        setIsWalletConnected(true);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      setError('Failed to check wallet connection');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await requestAccess();
      const pubKey = await getPublicKey();
      
      setPublicKey(pubKey);
      setIsWalletConnected(true);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setPublicKey(null);
    setError(null);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const value: WalletContextType = {
    isConnected: isWalletConnected,
    publicKey,
    connectWallet,
    disconnectWallet,
    loading,
    error,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};