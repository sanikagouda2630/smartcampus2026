import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, onClick, active = false }) {
  const colorSchemes = {
    blue: {
      bg: 'from-blue-600/10 to-blue-900/5',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    amber: {
      bg: 'from-amber-600/10 to-amber-900/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    purple: {
      bg: 'from-purple-600/10 to-purple-900/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    emerald: {
      bg: 'from-emerald-600/10 to-emerald-900/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    rose: {
      bg: 'from-rose-600/10 to-rose-900/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/30',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-gradient-to-b ${scheme.bg} border ${
        active ? scheme.activeBorder : scheme.border
      } glass-card transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-white mt-1.5 tracking-tight font-outfit">
            {value}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
