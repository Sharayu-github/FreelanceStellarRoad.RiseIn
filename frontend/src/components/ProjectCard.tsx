import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, User, Clock, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

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

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlineSoon = () => {
    const deadline = new Date(project.deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 3 && daysDiff > 0;
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-stellar-600 transition-colors"
          >
            {project.title}
          </Link>
          <p className="text-gray-600 mt-2 line-clamp-2">{project.description}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="space-y-3">
        {/* Amount */}
        <div className="flex items-center space-x-2 text-gray-700">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{project.amount} XLM</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={`text-sm ${isDeadlineSoon() ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
            Deadline: {formatDate(project.deadline)}
          </span>
          {isDeadlineSoon() && <Clock className="h-4 w-4 text-orange-500" />}
        </div>

        {/* Client */}
        <div className="flex items-center space-x-2 text-gray-700">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Client: {formatAddress(project.client)}</span>
        </div>

        {/* Freelancer (if assigned) */}
        {project.freelancer && (
          <div className="flex items-center space-x-2 text-gray-700">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Freelancer: {formatAddress(project.freelancer)}</span>
          </div>
        )}

        {/* Created date */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          Created: {formatDate(project.createdAt)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <Link
          to={`/projects/${project.id}`}
          className="btn btn-primary w-full text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;