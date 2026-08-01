import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { useWallet } from '../context/WalletContext';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';

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

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { isConnected } = useWallet();

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      id: 1,
      title: 'Modern React Dashboard Development',
      description: 'Build a responsive admin dashboard with React, TypeScript, and Tailwind CSS. Must include charts, user management, and real-time notifications.',
      amount: '500',
      deadline: '2024-02-15',
      status: 'open',
      client: 'GABC123DEFG456HIJKLMNOP789QRSTUVWXYZ123456789ABCDEFGHIJK',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Smart Contract Audit',
      description: 'Security audit of Soroban smart contracts for DeFi protocol. Looking for experienced blockchain security auditor.',
      amount: '2000',
      deadline: '2024-02-20',
      status: 'in_progress',
      client: 'GDEF456GHI789JKLMNOPQR123STUVWXYZ456789ABCDEFGHIJK123LMN',
      freelancer: 'GHIJ789KLM012NOPQRSTUVWXYZ345ABCDEFG678901234567890PQR',
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      title: 'Mobile App UI/UX Design',
      description: 'Design user interface and experience for a cryptocurrency wallet mobile application. Need modern, clean design with excellent UX.',
      amount: '800',
      deadline: '2024-02-25',
      status: 'submitted',
      client: 'GSTU901VWX234YZABCDEFGHIJK567LMNOPQR890123456789CDEFGH',
      freelancer: 'GKLM345NOP678QRSTUVWXYZ901ABCDEFG234567890123456HIJ',
      createdAt: '2024-01-12'
    },
    {
      id: 4,
      title: 'Content Writing for Tech Blog',
      description: 'Write 10 high-quality articles about blockchain technology, DeFi, and cryptocurrency trends. SEO optimized content required.',
      amount: '300',
      deadline: '2024-03-01',
      status: 'completed',
      client: 'GVWX567YZA890BCDEFGHIJKLM123NOPQRSTUVW456789012345XYZ',
      freelancer: 'GNOP901QRS234TUVWXYZABC567DEFGHIJ890123456789012KLM',
      createdAt: '2024-01-08'
    },
    {
      id: 5,
      title: 'Stellar Integration Development',
      description: 'Integrate Stellar payment system into existing e-commerce platform. Must handle multi-currency transactions and escrow.',
      amount: '1200',
      deadline: '2024-02-28',
      status: 'open',
      client: 'GYZA123BCD456EFGHIJKLMNOP789QRSTUVWXYZ012345678901EFG',
      createdAt: '2024-01-14'
    },
    {
      id: 6,
      title: 'DevOps Infrastructure Setup',
      description: 'Set up CI/CD pipeline with Docker, Kubernetes, and monitoring for microservices architecture on AWS.',
      amount: '1500',
      deadline: '2024-03-05',
      status: 'open',
      client: 'GBCD789EFG012HIJKLMNOPQR345STUVWXYZ678901234567890HIJ',
      createdAt: '2024-01-16'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchProjects = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProjects(mockProjects);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'amount_high':
        filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
        break;
      case 'amount_low':
        filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, sortBy]);

  const statusCounts = {
    all: projects.length,
    open: projects.filter(p => p.status === 'open').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    submitted: projects.filter(p => p.status === 'submitted').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Projects
          </h1>
          <p className="text-gray-600">
            Find exciting freelance opportunities with secured payments
          </p>
        </div>
        {isConnected && (
          <Link
            to="/create-project"
            className="btn btn-primary flex items-center space-x-2 mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              className="input pl-10 w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="open">Open ({statusCounts.open})</option>
              <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
              <option value="submitted">Submitted ({statusCounts.submitted})</option>
              <option value="completed">Completed ({statusCounts.completed})</option>
            </select>
          </div>

          {/* Sort */}
          <select
            className="input w-full"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Highest Amount</option>
            <option value="amount_low">Lowest Amount</option>
            <option value="deadline">Deadline Soon</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-stellar-600" />
          <span className="ml-2 text-gray-600">Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No projects are available at the moment.'}
          </p>
          {isConnected && (
            <Link to="/create-project" className="btn btn-primary">
              Create the First Project
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectListPage;