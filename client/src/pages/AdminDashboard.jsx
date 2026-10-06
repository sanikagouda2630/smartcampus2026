import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RequestDetailModal from '../components/RequestDetailModal';
import {
  Shield,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Clock,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building,
  Timer,
  Edit3
} from 'lucide-react';

const DEPARTMENTS = [
  'All',
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

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Detail / Action modal
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (deptFilter !== 'All') params.append('department', deptFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await api.get(`/requests?${params.toString()}`);
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load campus requests:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, deptFilter, priorityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchStats();
    fetchRequests();
  }, [fetchRequests]);

  const handleRequestUpdated = (updatedReq) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
    );
    if (selectedRequest && selectedRequest._id === updatedReq._id) {
      setSelectedRequest(updatedReq);
    }
    fetchStats();
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">
                Campus Operations & Request Management
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time monitoring, departmental dispatching, SLA tracking, and resolution control.
            </p>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchRequests();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Admin KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard
            title="Total"
            value={stats ? stats.totalRequests : '...'}
            icon={Layers}
            color="blue"
            active={statusFilter === 'All'}
            onClick={() => setStatusFilter('All')}
          />
          <StatCard
            title="Pending"
            value={stats ? stats.pendingRequests : '...'}
            icon={Clock}
            color="amber"
            active={statusFilter === 'Pending'}
            onClick={() => setStatusFilter('Pending')}
          />
          <StatCard
            title="Assigned"
            value={stats ? stats.assignedRequests : '...'}
            icon={UserCheck}
            color="blue"
            active={statusFilter === 'Assigned'}
            onClick={() => setStatusFilter('Assigned')}
          />
          <StatCard
            title="In Progress"
            value={stats ? stats.inProgressRequests : '...'}
            icon={PlayCircle}
            color="purple"
            active={statusFilter === 'In Progress'}
            onClick={() => setStatusFilter('In Progress')}
          />
          <StatCard
            title="Completed"
            value={stats ? stats.completedRequests : '...'}
            icon={CheckCircle2}
            color="emerald"
            active={statusFilter === 'Completed'}
            onClick={() => setStatusFilter('Completed')}
          />
          <StatCard
            title="High Priority"
            value={stats ? stats.highPriorityRequests : '...'}
            icon={AlertTriangle}
            color="rose"
            active={priorityFilter === 'High'}
            onClick={() => setPriorityFilter(priorityFilter === 'High' ? 'All' : 'High')}
          />
          <StatCard
            title="Avg Resolution"
            value={stats ? `${stats.averageResolutionHours}h` : '...'}
            icon={Timer}
            color="emerald"
            subtitle="Campus SLA benchmark"
          />
        </div>

        {/* Department Workload Breakdown */}
        {stats?.departmentWorkload && stats.departmentWorkload.length > 0 && (
          <div className="glass-panel border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              Department Workload Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.departmentWorkload.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setDeptFilter(item._id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer ${
                    deptFilter === item._id
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white truncate">{item._id}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>Active: <strong className="text-amber-400">{item.active}</strong></span>
                    <span>Done: <strong className="text-emerald-400">{item.completed}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Management Table */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">
                All Campus Service Requests
              </h3>
              <p className="text-xs text-slate-400">
                Manage, reassign, update status, and review audit history for any ticket.
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, student, keyword..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1">
              <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Departments' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => toggleSort(sortBy === 'date' ? 'priority' : 'date')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Sort: {sortBy === 'date' ? 'Date' : 'Priority'} ({sortOrder})</span>
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Loading campus requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No matching service requests found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Department & Staff</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 block">{req.studentName}</span>
                        <span className="text-[11px] text-slate-400">{req.studentEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {req.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={req.priority} isEscalated={req.isEscalated} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <p className="font-medium text-slate-200">{req.assignedDepartment}</p>
                        <p className="text-[11px] text-slate-400">{req.assignedPerson}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(req);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Manage</span>
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

      {/* Admin Request Detail Drawer / Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        isAdmin={true}
        onRequestUpdated={handleRequestUpdated}
      />
    </div>
  );
}
