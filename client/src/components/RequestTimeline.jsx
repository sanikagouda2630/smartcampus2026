import React from 'react';
import { Clock, UserCheck, PlayCircle, CheckCircle2, Circle } from 'lucide-react';

const STEPS = ['Pending', 'Assigned', 'In Progress', 'Completed'];

const STATUS_ICONS = {
  'Pending': Clock,
  'Assigned': UserCheck,
  'In Progress': PlayCircle,
  'Completed': CheckCircle2
};

export default function RequestTimeline({ currentStatus, history = [] }) {
  const currentStepIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      <div className="relative flex items-center justify-between px-2 pt-2 pb-6">
        <div className="absolute left-6 right-6 top-6 -translate-y-1/2 h-0.5 bg-slate-800 -z-0">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%`
            }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const isDone = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = STATUS_ICONS[step] || Circle;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20'
                    : isDone
                    ? 'bg-blue-950 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-xs font-medium tracking-wide ${
                  isCurrent
                    ? 'text-blue-400 font-semibold'
                    : isDone
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Audit Trail Log */}
      <div className="border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Activity History & Audit Trail
        </h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {history.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No history records logged yet.</p>
          ) : (
            history.map((item, index) => {
              const EventIcon = STATUS_ICONS[item.status] || Circle;
              const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={index} className="relative group">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-blue-500" />
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-1.5">
                        <EventIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          {item.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          by <strong className="text-slate-300">{item.updatedBy}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{formattedDate}</span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/60 mt-1.5">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
