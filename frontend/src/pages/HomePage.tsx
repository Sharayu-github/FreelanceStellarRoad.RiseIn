import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle,
  Star,
  Globe
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Funds are locked in smart contracts until work is approved. No middleman can access your money.',
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Get paid immediately when work is approved. No waiting periods or payment delays.',
    },
    {
      icon: TrendingUp,
      title: 'Verifiable Reputation',
      description: 'Build an on-chain reputation that follows you everywhere. Cannot be faked or manipulated.',
    },
    {
      icon: Users,
      title: 'Global Workforce',
      description: 'Connect with talented freelancers worldwide. Work with anyone, anywhere, trustlessly.',
    },
  ];

  const stats = [
    { label: 'Total Projects', value: '1,234+', icon: CheckCircle },
    { label: 'Active Users', value: '5,678+', icon: Users },
    { label: 'Success Rate', value: '98.5%', icon: Star },
    { label: 'Countries', value: '45+', icon: Globe },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-stellar-600 via-stellar-700 to-stellar-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Freelance with
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {' '}Trust
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-stellar-100 max-w-3xl mx-auto">
              The first decentralized freelancing platform where funds are secured by smart contracts 
              and reputation is built on-chain, verifiable, and permanent.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <>
                  <Link
                    to="/projects"
                    className="bg-white text-stellar-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <span>Browse Projects</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/verifier"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-stellar-800 transition-colors"
                  >
                    Check Reputation
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/create-project"
                    className="bg-white text-stellar-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <span>Post a Project</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-stellar-800 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-stellar-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Stellar Freelance?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on Stellar blockchain with smart contracts that ensure security, 
              transparency, and fair payment for all parties.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-stellar-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, secure, and transparent freelancing process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-stellar-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-stellar-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Client Posts Project
              </h3>
              <p className="text-gray-600">
                Create a project with details and deposit funds into a secure escrow smart contract.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stellar-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-stellar-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Freelancer Delivers
              </h3>
              <p className="text-gray-600">
                Qualified freelancer accepts the project and submits completed work for review.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-stellar-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-stellar-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Automatic Payment
              </h3>
              <p className="text-gray-600">
                Client approves work, funds release instantly, and both parties' reputation updates on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stellar-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Freelancing?
          </h2>
          <p className="text-xl mb-8 text-stellar-100">
            Join thousands of clients and freelancers who trust our platform for secure, 
            transparent, and efficient project collaboration.
          </p>
          
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-stellar-200">
                Connect your Freighter wallet to get started
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center bg-white text-stellar-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                <span>Explore Projects</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/create-project"
                className="bg-white text-stellar-800 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Post Your First Project
              </Link>
              <Link
                to="/projects"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-stellar-800 transition-colors"
              >
                Find Work Opportunities
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;