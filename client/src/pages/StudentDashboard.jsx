import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CreateRequestModal from '../components/CreateRequestModal';
import RequestDetailModal from '../components/RequestDetailModal';
import {
  Sparkles,
  Search,
  Filter,
  FileQuestion,
  Clock,
  PlayCircle,
  CheckCircle2,
  ListOrdered,
  Eye,
  Wifi,
  Building,
  Zap,
  Wrench,
  BookOpen,
  Bus,
  RefreshCw
} from 'lucide-react';

const SERVICE_CARDS = [
  { name: 'IT / Wi-Fi', desc: 'Hostel & lab Wi-Fi, campus email, portal access', icon: Wifi, color: 'text-blue-400' },
  { name: 'Hostel', desc: 'Room allotment, furniture, roommate inquiries', icon: Building, color: 'text-indigo-400' },
  { name: 'Electrical', desc: 'Switchboards, fans, AC cooling, lighting fixtures', icon: Zap, color: 'text-amber-400' },
  { name: 'Plumbing', desc: 'Water leakage, washrooms, tap repairs', icon: Wrench, color: 'text-sky-400' },
  { name: 'Library', desc: 'Digital search kiosks, book reservation, quiet zones', icon: BookOpen, color: 'text-emerald-400' },
  { name: 'Transport', desc: 'Campus shuttle schedules, bus passes, routing', icon: Bus, color: 'text-purple-400' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);

      const res = await api.get(`/requests/my?${params.toString()}`);
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch student requests:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Statistics calculation for student
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'Pending').length,
    inProgress: requests.filter((r) => r.status === 'In Progress' || r.status === 'Assigned').length,
    completed: requests.filter((r) => r.status === 'Completed').length
  };

  const handleRequestCreated = (newReq) => {
    setRequests((prev) => [newReq, ...prev]);
    fetchRequests();
  };

  const handleRequestUpdated = (updatedReq) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
    );
    if (selectedRequest && selectedRequest._id === updatedReq._id) {
      setSelectedRequest(updatedReq);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Top Navigation */}
      <Navbar onOpenNewRequest={() => setIsCreateOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900 border border-blue-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Assistance Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Have a campus concern or facility problem? Submit a service ticket to get it resolved quickly without standing in administrative queues.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Service Request</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Submitted"
            value={stats.total}
            icon={ListOrdered}
            color="blue"
            subtitle="All logged tickets"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="amber"
            subtitle="Awaiting team intake"
          />
          <StatCard
            title="In Resolution"
            value={stats.inProgress}
            icon={PlayCircle}
            color="purple"
            subtitle="Active / In Progress"
          />
          <StatCard
            title="Resolved"
            value={stats.completed}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Successfully closed"
          />
        </div>

        {/* Campus Services Quick Directory */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Campus Service Catalog
            </h3>
            <span className="text-xs text-slate-500">Click any category to initiate a request</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SERVICE_CARDS.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.name}
                  onClick={() => setIsCreateOpen(true)}
                  className="p-3.5 rounded-2xl glass-card hover:border-blue-500/50 cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div className={`p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 w-fit mb-2 group-hover:border-blue-500/40 transition`}>
                    <Icon className={`w-5 h-5 ${svc.color}`} />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                    {svc.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {svc.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requests Management Section */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">
                My Service Requests
              </h3>
              <p className="text-xs text-slate-400">
                Track status changes, estimated resolution times, and department audit history.
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch md:self-auto">
              <button
                onClick={fetchRequests}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 transition"
                title="Refresh requests"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Request ID, category..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Pending', 'Assigned', 'In Progress', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    statusFilter === tab
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 ml-auto w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Requests Table / Cards */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Loading your campus requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 mb-3">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">No requests found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {search || statusFilter !== 'All'
                  ? 'Try changing search criteria or resetting filters.'
                  : 'You have not submitted any service requests yet.'}
              </p>
              {!search && statusFilter === 'All' && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
                >
                  Submit Your First Request
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      onClick={() => setSelectedRequest(req)}
                      className="hover:bg-slate-900/50 cursor-pointer transition group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400 group-hover:text-blue-300">
                        {req.requestId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {req.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {req.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={req.priority} isEscalated={req.isEscalated} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {req.assignedDepartment}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 text-slate-300 text-xs font-semibold transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Timeline</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRequestCreated={handleRequestCreated}
      />

      {/* Details & Audit Stepper Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        isAdmin={false}
        onRequestUpdated={handleRequestUpdated}
      />
    </div>
  );
}
