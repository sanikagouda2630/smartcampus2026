import React, { useState } from 'react';
import { api } from '../api/client';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  Wifi,
  Building,
  Zap,
  Wrench,
  BookOpen,
  Bus,
  Layers,
  CreditCard,
  Sparkles,
  Clock,
  Send,
  HelpCircle
} from 'lucide-react';

const CATEGORIES = [
  { name: 'IT / Wi-Fi', dept: 'IT Department', icon: Wifi },
  { name: 'Hostel', dept: 'Hostel Department', icon: Building },
  { name: 'Electrical', dept: 'Electrical Department', icon: Zap },
  { name: 'Plumbing', dept: 'Plumbing Department', icon: Wrench },
  { name: 'Library', dept: 'Library Department', icon: BookOpen },
  { name: 'Transport', dept: 'Transport Department', icon: Bus },
  { name: 'Classroom', dept: 'Campus Maintenance', icon: Layers },
  { name: 'ID Card', dept: 'Student Affairs', icon: CreditCard },
  { name: 'Cleaning/Maintenance', dept: 'Housekeeping Department', icon: Sparkles },
  { name: 'Other', dept: 'General Administration', icon: HelpCircle }
];

export default function CreateRequestModal({ isOpen, onClose, onRequestCreated }) {
  const { refreshNotifications } = useNotifications();
  const [category, setCategory] = useState('IT / Wi-Fi');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentCategoryObj = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];

  const estimatedSLA = {
    'High': '12 hours (High Urgency)',
    'Medium': '24 – 36 hours (Standard)',
    'Low': '48 – 72 hours (Low Priority)'
  }[priority];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the issue');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/requests', {
        category,
        priority,
        description: description.trim()
      });

      if (res.success) {
        refreshNotifications();
        onRequestCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Submit Campus Service Request
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Report an issue to campus facilities. A unique Request ID will be assigned automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Category / Department
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {CATEGORIES.map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.name;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => setCategory(item.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border text-left transition ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm shadow-blue-500/20 ring-1 ring-blue-500/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Low', color: 'border-teal-500/40 text-teal-300 bg-teal-500/10' },
                { label: 'Medium', color: 'border-amber-500/40 text-amber-300 bg-amber-500/10' },
                { label: 'High', color: 'border-rose-500/40 text-rose-300 bg-rose-500/10' }
              ].map((p) => {
                const isSelected = priority === p.label;
                return (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => setPriority(p.label)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                      isSelected
                        ? `${p.color} ring-2 ring-blue-500/40 shadow-sm`
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Problem Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue clearly (location, classroom number, specific symptoms)..."
              className="w-full bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          {/* Auto-Assignment & SLA Preview Box (Bonus Feature) */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Auto-routes to:</span>
              <strong className="text-slate-200">{currentCategoryObj.dept}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-amber-300/90 font-medium">{estimatedSLA}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
