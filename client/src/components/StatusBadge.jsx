import React from 'react';
import { Clock, UserCheck, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    'Pending': {
      label: 'Pending',
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: Clock,
      dot: 'bg-amber-400'
    },
    'Assigned': {
      label: 'Assigned',
      bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: UserCheck,
      dot: 'bg-blue-400'
    },
    'In Progress': {
      label: 'In Progress',
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      icon: PlayCircle,
      dot: 'bg-purple-400 animate-pulse'
    },
    'Completed': {
      label: 'Completed',
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      dot: 'bg-emerald-400'
    }
  };

  const current = configs[status] || configs['Pending'];
  const Icon = current.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
}
