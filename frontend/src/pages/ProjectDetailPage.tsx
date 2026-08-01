import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { stellarService } from '../services/stellarService';
import StatusBadge from '../components/StatusBadge';
import { 
  Calendar,
  DollarSign,
  User,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageSquare
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
  workRef?: string;
  skills: string[];
  createdAt: string;
  notes?: string;
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, publicKey } = useWallet();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workSubmission, setWorkSubmission] = useState('');
  const [workNotes, setWorkNotes] = useState('');

  // Mock project data
  const mockProject: Project = {
    id: parseInt(id || '1'),
    title: 'Modern React Dashboard Development',
    description: `Build a comprehensive admin dashboard using React 18, TypeScript, and Tailwind CSS. 

The dashboard should include:
- User management system with CRUD operations
- Real-time charts and analytics using Chart.js or similar
- Dark/light theme toggle
- Responsive design for mobile and desktop
- Integration with REST APIs
- Authentication and authorization
- Modern UI components library

Deliverables:
- Clean, well-commented source code
- Deployment-ready build
- Basic documentation
- Demo video showing all features

Requirements:
- Must use React 18+ with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Must be responsive
- Follow modern React best practices`,
    amount: '500',
    deadline: '2024-02-15',
    status: 'in_progress',
    client: 'GABC123DEFG456HIJKLMNOP789QRSTUVWXYZ123456789ABCDEFGHIJK',
    freelancer: 'GHIJ789KLM012NOPQRSTUVWXYZ345ABCDEFG678901234567890PQR',
    workRef: '',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'UI/UX Design'],
    createdAt: '2024-01-15',
    notes: 'Looking for an experienced React developer who can deliver high-quality, production-ready code.'
  };

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // In a real app, fetch from API/contract
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProject(mockProject);
      } catch (err: any) {
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleAcceptProject = async () => {
    if (!project || !publicKey) return;

    setActionLoading(true);
    try {
      await stellarService.acceptProject(project.id);
      setProject({
        ...project,
        status: 'in_progress',
        freelancer: publicKey
      });
    } catch (err: any) {
      setError(err.message || 'Failed to accept project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !publicKey || !workSubmission.trim()) return;

    setActionLoading(true);
    try {
      await stellarService.submitWork(project.id, workSubmission.trim());
      setProject({
        ...project,
        status: 'submitted',
        workRef: workSubmission.trim()
      });
      setWorkSubmission('');
      setWorkNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveWork = async () => {
    if (!project || !publicKey) return;

    setActionLoading(true);
    try {
      await stellarService.approveAndRelease(project.id);
      setProject({
        ...project,
        status: 'completed'
      });
    } catch (err: any) {
      setError(err.message || 'Failed to approve and release funds');
    } finally {
      setActionLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isClient = project?.client === publicKey;
  const isFreelancer = project?.freelancer === publicKey;
  const canAccept = project?.status === 'open' && !isClient && !project.freelancer;
  const canSubmit = project?.status === 'in_progress' && isFreelancer;
  const canApprove = project?.status === 'submitted' && isClient;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-stellar-600 mr-2" />
          <span className="text-gray-600">Loading project details...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={() => navigate('/projects')} className="btn btn-primary">
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {project.title}
          </h1>
          <StatusBadge status={project.status} size="lg" />
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="font-medium text-lg">{project.amount} XLM</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span>Posted: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Skills */}
        {project.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center bg-stellar-100 text-stellar-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Project Description
            </h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {project.description}
            </div>
            {project.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Additional Notes</h3>
                <p className="text-blue-800">{project.notes}</p>
              </div>
            )}
          </div>

          {/* Work Submission */}
          {project.workRef && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Submitted Work
              </h2>
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-gray-500" />
                <a
                  href={project.workRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stellar-600 hover:text-stellar-800 flex items-center space-x-1"
                >
                  <span>{project.workRef}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* Work Submission Form */}
          {canSubmit && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Submit Your Work
              </h2>
              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div>
                  <label className="label">
                    Work Reference (URL, IPFS Hash, or Description) *
                  </label>
                  <input
                    type="text"
                    value={workSubmission}
                    onChange={(e) => setWorkSubmission(e.target.value)}
                    className="input w-full"
                    placeholder="https://github.com/username/project or QmHash... or description of deliverables"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={workNotes}
                    onChange={(e) => setWorkNotes(e.target.value)}
                    className="input w-full"
                    rows={3}
                    placeholder="Any additional information for the client..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading || !workSubmission.trim()}
                  className="btn btn-success flex items-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Submit Work</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Participants */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Participants
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Client</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-mono">
                    {formatAddress(project.client)}
                  </span>
                  {isClient && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </div>

              {project.freelancer && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Freelancer</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-mono">
                      {formatAddress(project.freelancer)}
                    </span>
                    {isFreelancer && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              {!isConnected ? (
                <p className="text-sm text-gray-600">
                  Connect your wallet to interact with this project.
                </p>
              ) : canAccept ? (
                <button
                  onClick={handleAcceptProject}
                  disabled={actionLoading}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Accept Project</span>
                    </>
                  )}
                </button>
              ) : canApprove ? (
                <button
                  onClick={handleApproveWork}
                  disabled={actionLoading}
                  className="btn btn-success w-full flex items-center justify-center space-x-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve & Release Funds</span>
                    </>
                  )}
                </button>
              ) : (
                <p className="text-sm text-gray-600">
                  {project.status === 'completed' 
                    ? 'Project completed successfully!'
                    : project.status === 'open'
                    ? 'Project is available for freelancers to accept.'
                    : project.status === 'in_progress'
                    ? 'Work is in progress.'
                    : project.status === 'submitted'
                    ? 'Work has been submitted for review.'
                    : 'Project status updated.'
                  }
                </p>
              )}
            </div>
          </div>

          {/* Project Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-stellar-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Project Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {project.freelancer && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Project Accepted</p>
                    <p className="text-xs text-gray-500">Freelancer assigned</p>
                  </div>
                </div>
              )}

              {project.workRef && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Work Submitted</p>
                    <p className="text-xs text-gray-500">Ready for review</p>
                  </div>
                </div>
              )}

              {project.status === 'completed' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Project Completed</p>
                    <p className="text-xs text-gray-500">Funds released</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;