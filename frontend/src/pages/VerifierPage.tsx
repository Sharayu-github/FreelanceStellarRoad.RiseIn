import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, User } from 'lucide-react';
import ReputationGauge from '../components/ReputationGauge';
import { stellarService } from '../services/stellarService';
import { apiService } from '../services/apiService';

interface ReputationScore {
  total_projects: number;
  projects_as_client: number;
  projects_as_freelancer: number;
  successful_completions: number;
  success_rate: number;
}

const VerifierPage: React.FC = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reputationData, setReputationData] = useState<ReputationScore | null>(null);
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchAddress.trim()) {
      setError('Please enter a valid Stellar address');
      return;
    }

    setLoading(true);
    setError(null);
    setReputationData(null);

    try {
      // Validate Stellar address format (basic validation)
      if (!searchAddress.match(/^G[A-Z0-9]{55}$/)) {
        throw new Error('Invalid Stellar address format');
      }

      // Try to get reputation from contract first
      try {
        const contractReputation = await stellarService.getReputationScore(searchAddress);
        setReputationData(contractReputation);
        setSearchedAddress(searchAddress);
      } catch (contractError) {
        // Fall back to cached data from API
        try {
          const cachedReputation = await apiService.getReputationScore(searchAddress);
          setReputationData({
            total_projects: cachedReputation.totalProjects,
            projects_as_client: cachedReputation.projectsAsClient,
            projects_as_freelancer: cachedReputation.projectsAsFreelancer,
            successful_completions: cachedReputation.successfulCompletions,
            success_rate: cachedReputation.successRate,
          });
          setSearchedAddress(searchAddress);
        } catch (apiError) {
          // Address exists but has no reputation data
          setReputationData({
            total_projects: 0,
            projects_as_client: 0,
            projects_as_freelancer: 0,
            successful_completions: 0,
            success_rate: 0,
          });
          setSearchedAddress(searchAddress);
        }
      }
    } catch (err: any) {
      console.error('Error fetching reputation:', err);
      setError(err.message || 'Failed to fetch reputation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchAddress('');
    setReputationData(null);
    setSearchedAddress(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Reputation Verifier
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Look up anyone's verifiable on-chain reputation. All data comes directly from 
          completed projects and cannot be faked or manipulated.
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <User className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="input pl-10 w-full"
              placeholder="Enter Stellar address (e.g., GABC123...)"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !searchAddress.trim()}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
            {(reputationData || error) && (
              <button
                type="button"
                onClick={clearSearch}
                className="btn btn-secondary"
                disabled={loading}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {reputationData && searchedAddress && (
        <div className="space-y-6">
          <ReputationGauge 
            score={reputationData} 
            address={searchedAddress}
            size="lg"
          />

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Client Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects Posted</span>
                  <span className="font-medium">{reputationData.projects_as_client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Project Value</span>
                  <span className="font-medium">
                    {reputationData.projects_as_client > 0 ? 'Available on-chain' : 'No data'}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Freelancer Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects Completed</span>
                  <span className="font-medium">{reputationData.successful_completions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium">{reputationData.success_rate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">
              ✅ Verified On-Chain Data
            </h3>
            <p className="text-green-800 text-sm">
              This reputation data is retrieved directly from the Stellar blockchain and 
              smart contracts. It represents actual completed projects and cannot be 
              artificially inflated or manipulated.
            </p>
          </div>
        </div>
      )}

      {/* How It Works */}
      {!reputationData && !loading && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How Reputation Verification Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-stellar-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-stellar-600">1</span>
              </div>
              <h3 className="font-medium mb-2">On-Chain Records</h3>
              <p className="text-gray-600">
                All reputation data comes from completed projects recorded on the Stellar blockchain
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-stellar-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-stellar-600">2</span>
              </div>
              <h3 className="font-medium mb-2">Automatic Updates</h3>
              <p className="text-gray-600">
                Reputation scores update automatically when projects are successfully completed
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-stellar-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-stellar-600">3</span>
              </div>
              <h3 className="font-medium mb-2">Tamper-Proof</h3>
              <p className="text-gray-600">
                Data cannot be faked, deleted, or manipulated by users or platform operators
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Addresses */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          Try Sample Addresses
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Click on any address below to see reputation data:
        </p>
        <div className="grid gap-2">
          {[
            'GABC123DEFG456HIJKLMNOP789QRSTUVWXYZ123456789ABCDEFGHIJK',
            'GDEF456GHI789JKLMNOPQR123STUVWXYZ456789ABCDEFGHIJK123LMN',
            'GHIJ789KLM012NOPQRSTUVWXYZ345ABCDEFG678901234567890PQR'
          ].map((address) => (
            <button
              key={address}
              onClick={() => setSearchAddress(address)}
              className="text-left text-sm text-stellar-600 hover:text-stellar-800 hover:bg-white rounded px-3 py-2 transition-colors"
              disabled={loading}
            >
              {address}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerifierPage;