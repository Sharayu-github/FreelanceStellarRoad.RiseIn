import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

const WalletButton: React.FC = () => {
  const { isConnected, publicKey, connectWallet, disconnectWallet, loading, error } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <button disabled className="btn btn-secondary">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (isConnected && publicKey) {
    return (
      <div className="flex items-center space-x-2">
        <div className="hidden sm:flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{formatAddress(publicKey)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="btn btn-secondary flex items-center space-x-2"
          title="Disconnect Wallet"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connectWallet}
        className="btn btn-primary flex items-center space-x-2"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Freighter</span>
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
};

export default WalletButton;