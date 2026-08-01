import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import WalletButton from './WalletButton';
import { Briefcase, Users, Search, Plus, LayoutDashboard } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isConnected, publicKey } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-stellar-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Stellar Freelance</h1>
              <p className="text-xs text-gray-500">Escrow & Reputation</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/projects"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/projects')
                  ? 'text-stellar-600 bg-stellar-50'
                  : 'text-gray-700 hover:text-stellar-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Projects</span>
            </Link>

            <Link
              to="/verifier"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/verifier')
                  ? 'text-stellar-600 bg-stellar-50'
                  : 'text-gray-700 hover:text-stellar-600 hover:bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Reputation Lookup</span>
            </Link>

            {isConnected && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-stellar-600 bg-stellar-50'
                      : 'text-gray-700 hover:text-stellar-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/create-project"
                  className="flex items-center space-x-1 bg-stellar-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-stellar-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </Link>
              </>
            )}
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-4">
            {isConnected && publicKey && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{formatAddress(publicKey)}</span>
              </div>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/projects"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/projects')
                  ? 'text-stellar-600 bg-stellar-50'
                  : 'text-gray-700 hover:text-stellar-600 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="h-5 w-5" />
              <span>Projects</span>
            </Link>

            <Link
              to="/verifier"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                isActive('/verifier')
                  ? 'text-stellar-600 bg-stellar-50'
                  : 'text-gray-700 hover:text-stellar-600 hover:bg-gray-50'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Reputation Lookup</span>
            </Link>

            {isConnected && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard')
                      ? 'text-stellar-600 bg-stellar-50'
                      : 'text-gray-700 hover:text-stellar-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/create-project"
                  className="flex items-center space-x-2 bg-stellar-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-stellar-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Project</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;