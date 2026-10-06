import React, { useState } from 'react';
import { api } from '../api/client';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import RequestTimeline from './RequestTimeline';
import {
  X,
  Building,
  User,
  Clock,
  Calendar,
  Send,
  AlertCircle,
  FileText
} from 'lucide-react';

const DEPARTMENTS = [
  'IT Department',
  'Hostel Department',
  'Electrical Department',
  'Plumbing Department',
  'Library Department',
  'Transport Department',
  'Campus Maintenance',
  'Student Affairs',
  'Housekeeping Department',
  'General Administration'
];

const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Completed'];

export default function RequestDetailModal({
  request,
  isOpen,
  onClose,
  isAdmin = false,
  onRequestUpdated
}) {
  if (!isOpen || !request) return null;

  const [department, setDepartment] = useState(request.assignedDepartment || 'General Administration');
  const [assignedPerson, setAssignedPerson] = useState(request.assignedPerson === 'Unassigned' ? '' : request.assignedPerson);
  const [status, setStatus] = useState(request.status);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle Admin status & remarks update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await api.patch(`/requests/${request._id}/status`, {
        status,
        remarks: remarks.trim()
      });

      if (res.success) {
        setMessage(`Status updated to ${status}`);
        setRemarks('');
        onRequestUpdated(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin department & technician assignment
  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await api.patch(`/requests/${request._id}/assign`, {
        department,
        assignedPerson: assignedPerson.trim() || 'Department Technician',
        remarks: remarks.trim()
      });

      if (res.success) {
        setMessage('Assigned successfully');
        setRemarks('');
        onRequestUpdated(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign department');
    } finally {
      setLoading(false);
    }
  };

  const createdDate = new Date(request.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const estimatedDate = request.estimatedCompletion
    ? new Date(request.estimatedCompletion).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : 'Standard SLA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col glass-panel border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 text-sm">
              {request.requestId}
            </span>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} isEscalated={request.isEscalated} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              ✓ {message}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              ⚠ {error}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Department</span>
                <strong className="text-slate-200">{request.assignedDepartment || 'Pending Assignment'}</strong>
                {request.assignedPerson && request.assignedPerson !== 'Unassigned' && (
                  <p className="text-[11px] text-slate-400 mt-0.5">Staff: {request.assignedPerson}</p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-2.5">
              <User className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Submitted By</span>
                <strong className="text-slate-200">{request.studentName}</strong>
                <p className="text-[11px] text-slate-400 mt-0.5">{request.studentEmail}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Date Submitted</span>
                <span className="text-slate-300">{createdDate}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Target SLA Completion</span>
                <span className="text-slate-300 font-medium">{estimatedDate}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Problem Description ({request.category})
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
            {request.remarks && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block">Latest Remark:</span>
                <p className="text-xs text-slate-300 mt-0.5 italic">{request.remarks}</p>
              </div>
            )}
          </div>

          {/* Admin Management Controls */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Administrative Actions & Resolution
              </h4>

              {/* Status Update Form */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Update Workflow Stage
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Assign Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Assign Technician / Staff
                    </label>
                    <input
                      type="text"
                      value={assignedPerson}
                      onChange={(e) => setAssignedPerson(e.target.value)}
                      placeholder="e.g. Marcus Vance (Network Eng.)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="w-full sm:w-1/2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Add Remarks / Update Note
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Provide progress details or resolution notes..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 disabled:opacity-50"
                  >
                    Save Assignment
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Apply Status Change</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Stepper & Audit Trail */}
          <div className="pt-2">
            <RequestTimeline currentStatus={request.status} history={request.history} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
