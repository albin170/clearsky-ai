import React, { useState, useEffect } from 'react';
import { 
  Settings, Bell, Shield, Trash2, Moon, 
  Sun, CheckCircle2, AlertTriangle, Lock 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { NotificationAlert } from '../../types';

export const SettingsView: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { currentCity, currentLat, currentLon } = useLocation();

  const [highAqiAlert, setHighAqiAlert] = useState(true);
  const [aqiThreshold, setAqiThreshold] = useState(150);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [filterReminders, setFilterReminders] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [prefs, altList] = await Promise.all([
          api.getNotificationPreferences(),
          api.getActiveAlerts(currentLat, currentLon, currentCity),
        ]);
        if (prefs) {
          setHighAqiAlert(prefs.high_aqi_alert);
          setAqiThreshold(prefs.aqi_threshold);
          setMorningBriefing(prefs.daily_morning_briefing);
          setFilterReminders(prefs.purifier_filter_reminders);
          setQuietHoursStart(prefs.quiet_hours_start);
          setQuietHoursEnd(prefs.quiet_hours_end);
        }
        setAlerts(altList);
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, [currentCity, currentLat, currentLon]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateNotificationPreferences({
        high_aqi_alert: highAqiAlert,
        aqi_threshold: aqiThreshold,
        daily_morning_briefing: morningBriefing,
        purifier_filter_reminders: filterReminders,
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you absolutely sure you want to delete your ClearSky AI account? This will permanently purge all your personal routines, saved locations, and impact logs in compliance with data privacy regulations.')) {
      await deleteAccount();
      alert('Account and data permanently deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Platform Settings & Notifications</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure exposure thresholds, notification schedules, and manage data privacy
          </p>
        </div>
      </div>

      {/* Active Notifications Alert Feed */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Active Environmental Advisories ({currentCity})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-sm text-white">{alt.title}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{alt.message}</p>
                <div className="text-[11px] text-teal-400 font-medium pt-1 border-t border-neutral-850">
                  Action: {alt.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Preferences Form */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-5">
        <h3 className="font-extrabold text-base text-white border-b border-neutral-800 pb-3">
          Smart Alert Thresholds
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">AQI Alert Threshold</span>
                <p className="text-xs text-neutral-400">Trigger warnings when outdoor air reaches this level</p>
              </div>
              <span className="text-lg font-black text-teal-400">AQI {aqiThreshold}</span>
            </div>
            <input
              type="range"
              min={50}
              max={300}
              step={10}
              value={aqiThreshold}
              onChange={(e) => setAqiThreshold(Number(e.target.value))}
              className="w-full h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div>
                <span className="text-xs font-semibold text-white block">Daily Morning Briefing</span>
                <span className="text-[11px] text-neutral-400">Morning outdoor safety alert at 7:00 AM</span>
              </div>
              <input
                type="checkbox"
                checked={morningBriefing}
                onChange={(e) => setMorningBriefing(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-neutral-900 border-neutral-700"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div>
                <span className="text-xs font-semibold text-white block">Purifier Filter Reminders</span>
                <span className="text-[11px] text-neutral-400">Monthly pre-filter cleaning notifications</span>
              </div>
              <input
                type="checkbox"
                checked={filterReminders}
                onChange={(e) => setFilterReminders(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-neutral-900 border-neutral-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Quiet Hours Start</label>
              <input
                type="text"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Quiet Hours End</label>
              <input
                type="text"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-md shadow-teal-900/30"
            >
              Save Notification Preferences
            </button>
            {isSaved && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Preferences saved!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account & Data Privacy Center */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
        <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-teal-400" />
          <span>Account Security & Data Privacy Center</span>
        </h3>

        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
          <p>
            <strong>Right to be Forgotten:</strong> You maintain full ownership over your environmental data.
            ClearSky AI does not monetize or transmit your private household location data to external third parties.
          </p>
          {user && (
            <div className="pt-2 text-neutral-400 border-t border-neutral-900 flex justify-between">
              <span>Account: {user.email}</span>
              <span className="text-teal-400 font-mono">Role: {user.role}</span>
            </div>
          )}
        </div>

        {user && (
          <div className="pt-2">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-bold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge All My Data & Delete Account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
