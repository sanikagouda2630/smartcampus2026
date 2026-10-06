import React from 'react';
import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

export default function PriorityBadge({ priority, isEscalated }) {
  const configs = {
    'High': {
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: ArrowUp,
      iconColor: 'text-rose-400'
    },
    'Medium': {
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      icon: ArrowRight,
      iconColor: 'text-amber-400'
    },
    'Low': {
      bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      icon: ArrowDown,
      iconColor: 'text-teal-400'
    }
  };

  const current = configs[priority] || configs['Medium'];
  const Icon = current.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium ${current.bg}`}
      >
        <Icon className={`w-3 h-3 ${current.iconColor}`} />
        <span>{priority}</span>
      </span>

      {isEscalated && (
        <span
          title="High-priority SLA exceeded - Flagged for immediate escalation"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border bg-red-600/30 text-red-200 border-red-500/60 text-[11px] font-bold tracking-wide animate-pulse"
        >
          <AlertTriangle className="w-3 h-3 text-red-400" />
          ESCALATED
        </span>
      )}
    </div>
  );
}
