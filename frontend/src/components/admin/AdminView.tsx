import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Users, Flag, FileText, 
  Check, X, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { User, CommunityReport } from '../../types';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'moderation' | 'audit'>('health');
  const [healthData, setHealthData] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [h, u, r, a] = await Promise.all([
        api.getAdminHealth(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getAuditLogs(),
      ]);
      setHealthData(h);
      setUsers(u);
      setReports(r);
      setAuditLogs(a);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await api.updateAdminUserRole(userId, role);
      await loadAdminData();
      alert('User role updated successfully');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await api.toggleAdminUserActive(userId);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleModerateReport = async (reportId: number, status: string) => {
    try {
      await api.moderateReport(reportId, status);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">ClearSky Administrative & Moderation Center</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Role-based platform operations, API health telemetry, user controls, and citizen report moderation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-3">
        {[
          { id: 'health', label: 'System Telemetry', icon: Activity },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'moderation', label: `Moderation (${reports.length})`, icon: Flag },
          { id: 'audit', label: `Audit Logs (${auditLogs.length})`, icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Health / Telemetry Tab */}
      {activeTab === 'health' && healthData && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Platform Status</span>
              <div className="text-xl font-black text-emerald-400 mt-1 flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{healthData.status}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Open-Meteo Gateway</span>
              <div className="text-xl font-black text-white mt-1">Operational</div>
              <span className="text-[10px] text-neutral-500">{healthData.open_meteo_api}</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">GenAI Provider</span>
              <div className="text-xl font-black text-teal-300 mt-1">
                {healthData.gemini_api_configured ? 'Gemini 1.5/2.0 API' : 'ClearSky Grounded RAG'}
              </div>
              <span className="text-[10px] text-neutral-500">Deterministic Fallback Ready</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Database Engine</span>
              <div className="text-xl font-black text-white mt-1">SQLite Async</div>
              <span className="text-[10px] text-neutral-500">aiosqlite Connection Pool</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h3 className="font-bold text-sm text-white">Aggregated Platform Activity Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                <div className="text-2xl font-black text-white">{healthData.active_users_count}</div>
                <div className="text-xs text-neutral-400">Registered Citizens</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                <div className="text-2xl font-black text-white">{healthData.total_communities}</div>
                <div className="text-xs text-neutral-400">Active Coalitions</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-850">
                <div className="text-2xl font-black text-white">{healthData.total_impact_logs}</div>
                <div className="text-xs text-neutral-400">Recorded Sustainable Actions</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="pb-3">User ID</th>
                <th className="pb-3">Full Name & Email</th>
                <th className="pb-3">Current Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-800/40 transition">
                  <td className="py-3 font-mono text-neutral-500">#{u.id}</td>
                  <td className="py-3">
                    <div className="font-bold text-white">{u.full_name}</div>
                    <div className="text-[11px] text-neutral-400">{u.email}</div>
                  </td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-teal-300 font-bold"
                    >
                      <option value="standard_user">standard_user</option>
                      <option value="community_manager">community_manager</option>
                      <option value="moderator">moderator</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white">Community Pollution Reports Moderation Queue</h3>
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{r.title}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {r.report_type}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1">{r.description}</p>
                  <div className="text-[11px] text-neutral-500 mt-1">Location: {r.address}</div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button
                    onClick={() => handleModerateReport(r.id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleModerateReport(r.id, 'flagged_spam')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold"
                  >
                    Flag Spam
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-2">
          <h3 className="font-bold text-sm text-white mb-3">Security & Administrative Audit Logs</h3>
          <div className="divide-y divide-neutral-800/80 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 text-xs flex items-center justify-between">
                <div>
                  <span className="font-mono text-purple-400 font-bold mr-2">[{log.action}]</span>
                  <span className="text-neutral-300">{log.details}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono shrink-0 ml-4">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
