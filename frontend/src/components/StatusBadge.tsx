import React from 'react';
import { Circle, Clock, FileText, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return {
          icon: Circle,
          text: 'Open',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'in_progress':
      case 'inprogress':
        return {
          icon: Clock,
          text: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'submitted':
        return {
          icon: FileText,
          text: 'Submitted',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'refunded':
        return {
          icon: RefreshCw,
          text: 'Refunded',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Unknown',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;