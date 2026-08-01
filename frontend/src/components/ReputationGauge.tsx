import React from 'react';
import { Star, Award, Briefcase, TrendingUp } from 'lucide-react';

interface ReputationScore {
  total_projects: number;
  projects_as_client: number;
  projects_as_freelancer: number;
  successful_completions: number;
  success_rate: number;
}

interface ReputationGaugeProps {
  score: ReputationScore;
  address: string;
  size?: 'sm' | 'md' | 'lg';
}

const ReputationGauge: React.FC<ReputationGaugeProps> = ({ 
  score, 
  address, 
  size = 'md' 
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getReputationLevel = (successRate: number, totalProjects: number) => {
    if (totalProjects === 0) return { level: 'New', color: 'gray' };
    if (successRate >= 95 && totalProjects >= 10) return { level: 'Elite', color: 'purple' };
    if (successRate >= 90 && totalProjects >= 5) return { level: 'Expert', color: 'blue' };
    if (successRate >= 80) return { level: 'Skilled', color: 'green' };
    if (successRate >= 70) return { level: 'Developing', color: 'yellow' };
    return { level: 'Beginner', color: 'orange' };
  };

  const reputation = getReputationLevel(score.success_rate, score.total_projects);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`font-semibold text-gray-900 ${sizeClasses[size]}`}>
            Reputation Score
          </h3>
          <p className="text-gray-600 text-sm">{formatAddress(address)}</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-${reputation.color}-800 bg-${reputation.color}-100`}>
          <Award className={iconSizes[size]} />
          <span className="font-medium">{reputation.level}</span>
        </div>
      </div>

      {/* Success Rate Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${score.success_rate * 2.51} 251.2`}
              strokeLinecap="round"
              className={`text-${reputation.color}-500`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {score.success_rate}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Briefcase className={`${iconSizes[size]} text-gray-500`} />
            <span className="text-2xl font-bold text-gray-900">
              {score.total_projects}
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Projects</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <TrendingUp className={`${iconSizes[size]} text-green-500`} />
            <span className="text-2xl font-bold text-gray-900">
              {score.successful_completions}
            </span>
          </div>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {score.projects_as_client}
          </div>
          <p className="text-xs text-gray-600">As Client</p>
        </div>

        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">
            {score.projects_as_freelancer}
          </div>
          <p className="text-xs text-gray-600">As Freelancer</p>
        </div>
      </div>

      {/* Reputation Indicators */}
      {score.total_projects > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Reliability</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(score.success_rate / 20)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No data message */}
      {score.total_projects === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">No projects completed yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Complete projects to build your reputation
          </p>
        </div>
      )}
    </div>
  );
};

export default ReputationGauge;