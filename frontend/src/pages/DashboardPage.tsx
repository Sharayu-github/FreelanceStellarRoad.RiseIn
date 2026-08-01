import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import ProjectCard from '../components/ProjectCard';
import ReputationGauge from '../components/ReputationGauge';
import StatusBadge from '../components/StatusBadge';
import { 
  Briefcase, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  status: string;
  client: string;
  freelancer?: string;
  createdAt: string;
}

interface DashboardStats {
  totalEarnings: string;
  totalSpent: string;
  activeProjects: number;
  completedProjects: number;
}

const DashboardPage: React.FC = () => {
  const { isConnected, publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client');
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [freelancerProjects, setFreelancerProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: '0',
    totalSpent: '0',
    activeProjects: 0,
    completedProjects: 0,
  });
  const [reputationScore, setReputationScore] = useState({
    total_projects: 0,
    projects_as_client: 0,
    projects_as_freelancer: 0,
    successful_completions: 0,
    success_rate: 0,
  });

  // Mock data for demonstration
  useEffect(() => {
    if (!publicKey) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock client projects
      const mockClientProjects: Project[] = [
        {
          id: 1,
          title: 'React Dashboard Development',
          description: 'Build a modern dashboard with React and TypeScript',
          amount: '500',
          deadline: '2024-02-15',
          status: 'in_progress',
          client: publicKey,
          freelancer: 'GHIJ789KLM012NOPQRSTUVWXYZ345ABCDEFG678901234567890PQR',
          createdAt: '2024-01-15'
        },
        {
          id: 5,
          title: 'Mobile App Design',
          description: 'Design UI/UX for crypto wallet mobile app',
          amount: '800',
          deadline: '2024-02-20',
          status: 'open',
          client: publicKey,
          createdAt: '2024-01-18'
        }
      ];

      // Mock freelancer projects
      const mockFreelancerProjects: Project[] = [
        {
          id: 2,
          title: 'Smart Contract Audit',
          description: 'Security audit of DeFi protocol contracts',
          amount: '2000',
          deadline: '2024-02-25',
          status: 'submitted',
          client: 'GDEF456GHI789JKLMNOPQR123STUVWXYZ456789ABCDEFGHIJK123LMN',
          freelancer: publicKey,
          createdAt: '2024-01-10'
        },
        {
          id: 4,
          title: 'Content Writing',
          description: 'Write blockchain tech articles',
          amount: '300',
          deadline: '2024-01-30',
          status: 'completed',
          client: 'GVWX567YZA890BCDEFGHIJKLM123NOPQRSTUVW456789012345XYZ',
          freelancer: publicKey,
          createdAt: '2024-01-08'
        }
      ];

      setClientProjects(mockClientProjects);
      setFreelancerProjects(mockFreelancerProjects);

      // Calculate stats
      const clientSpent = mockClientProjects
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const freelancerEarned = mockFreelancerProjects
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const activeCount = [...mockClientProjects, ...mockFreelancerProjects]
        .filter(p => ['open', 'in_progress', 'submitted'].includes(p.status)).length;
      
      const completedCount = [...mockClientProjects, ...mockFreelancerProjects]
        .filter(p => p.status === 'completed').length;

      setStats({
        totalEarnings: freelancerEarned.toString(),
        totalSpent: clientSpent.toString(),
        activeProjects: activeCount,
        completedProjects: completedCount,
      });

      // Mock reputation score
      setReputationScore({
        total_projects: mockClientProjects.length + mockFreelancerProjects.length,
        projects_as_client: mockClientProjects.length,
        projects_as_freelancer: mockFreelancerProjects.length,
        successful_completions: completedCount,
        success_rate: completedCount > 0 ? Math.round((completedCount / (mockClientProjects.length + mockFreelancerProjects.length)) * 100) : 0,
      });

      setLoading(false);
    };

    fetchDashboardData();
  }, [publicKey]);

  if (!isConnected || !publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wallet Connection Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your Freighter wallet to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-stellar-600 mr-2" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const currentProjects = activeTab === 'client' ? clientProjects : freelancerProjects;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's your activity overview.
          </p>
        </div>
        <Link
          to="/create-project"
          className="btn btn-primary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Project</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Stats and Reputation */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Earned</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalEarnings} XLM</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalSpent} XLM</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completedProjects}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reputation */}
          <ReputationGauge score={reputationScore} address={publicKey} />
        </div>

        {/* Right Column - Projects */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'client'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              As Client ({clientProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('freelancer')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'freelancer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              As Freelancer ({freelancerProjects.length})
            </button>
          </div>

          {/* Projects List */}
          {currentProjects.length === 0 ? (
            <div className="card p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'client' 
                  ? 'Create your first project to get started'
                  : 'Browse available projects to start working'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {activeTab === 'client' ? (
                  <Link to="/create-project" className="btn btn-primary">
                    Create Project
                  </Link>
                ) : (
                  <Link to="/projects" className="btn btn-primary">
                    Browse Projects
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentProjects.map((project) => (
                <div key={project.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-stellar-600 transition-colors"
                      >
                        {project.title}
                      </Link>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{project.amount} XLM</span>
                    </span>
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link
                      to={`/projects/${project.id}`}
                      className="btn btn-primary text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;