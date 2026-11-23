import React, { useEffect } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle, PhoneCall } from 'lucide-react';
import { useLocation, useLanguage } from '../../context/hooks';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { airQuality, currentCity } = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const aqi = airQuality?.current.aqi_in || 280;
  const pm25 = airQuality?.current.pm2_5 || 115.0;
  const isMl = language === 'ml';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-neutral-950 border-2 border-red-500 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-rose-900 to-red-950 p-6 border-b border-red-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600/30 border border-red-500 rounded-xl animate-pulse">
              <ShieldAlert className="w-8 h-8 text-red-400" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-red-300">
                {isMl ? 'അടിയന്തര മുന്നറിയിപ്പ്' : 'CRITICAL ENVIRONMENTAL DEFENSE PROTOCOL'}
              </div>
              <h2 id="emergency-modal-title" className="text-2xl font-black text-white">
                {isMl ? 'അടിയന്തര പുകമഞ്ഞ് പ്രതിരോധം' : 'EMERGENCY SMOG MODE ACTIVATED'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            aria-label="Close Emergency Mode"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Situation banner */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center justify-between">
            <div>
              <div className="text-xs text-red-300 uppercase tracking-wider">{currentCity} - Current Severity</div>
              <div className="text-3xl font-black text-red-400">AQI {aqi} • PM2.5: {pm25} µg/m³</div>
              <div className="text-sm text-neutral-300 mt-1">
                {isMl
                  ? 'അന്തരീക്ഷത്തിൽ വിഷപ്പുക അടിഞ്ഞുകൂടിയിരിക്കുന്നു. ശ്വാസകോശ സംരക്ഷണത്തിന് അതീവ ജാഗ്രത പാലിക്കുക.'
                  : 'Severe atmospheric particulate ceiling. Outdoor air poses immediate respiratory and vascular risk.'}
              </div>
            </div>
            <div className="px-4 py-2 bg-red-600 font-bold rounded-lg text-sm text-white uppercase tracking-wide">
              {isMl ? 'ലെവൽ 4 റെഡ് അലർട്ട്' : 'LEVEL 4 HAZARD'}
            </div>
          </div>

          {/* Action grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mandatory outdoor restrictions */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                <span>{isMl ? 'പുറത്തിറങ്ങുമ്പോഴുള്ള വിലക്കുകൾ' : 'Outdoor Restrictions'}</span>
              </div>
              <ul className="text-sm text-neutral-300 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold" aria-hidden="true">✕</span>
                  <span>
                    <strong>{isMl ? 'ഓട്ടവും നടത്തവും ഒഴിവാക്കുക:' : 'Halt all outdoor jogging/sports:'}</strong>{' '}
                    {isMl ? 'കഠിന ശ്വാസമെടുക്കൽ വിഷപുകയെ രക്തത്തിലേക്ക് എത്തിക്കും.' : 'Aerobic hyperventilation draws soot directly into capillary beds.'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold" aria-hidden="true">✕</span>
                  <span>
                    <strong>{isMl ? 'കുട്ടികളും വയോധികരും:' : 'Children & Elderly:'}</strong>{' '}
                    {isMl ? 'പുറത്തിറങ്ങുന്നത് കർശനമായി വിലക്കുക.' : 'Keep indoors. Close school outdoor playgrounds.'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold" aria-hidden="true">✓</span>
                  <span>
                    <strong>{isMl ? 'N95/FFP2 മാസ്ക്:' : 'Mandatory N95 Respirator:'}</strong>{' '}
                    {isMl ? 'പുറത്തുപോകുമ്പോൾ സർട്ടിഫൈഡ് N95 മാസ്ക് മാത്രം ധരിക്കുക.' : 'Surgical or cloth masks offer zero defense against 0.3µm smog.'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Indoor fortress checklist */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                <CheckCircle className="w-5 h-5" aria-hidden="true" />
                <span>{isMl ? 'വീടിനകത്തെ പ്രതിരോധ നടപടികൾ' : 'Indoor Safe Zone Protocols'}</span>
              </div>
              <ul className="text-sm text-neutral-300 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold" aria-hidden="true">✓</span>
                  <span>
                    <strong>{isMl ? 'ജനലുകൾ മുറുക്കെ അടയ്ക്കുക:' : 'Seal all windows & balconies:'}</strong>{' '}
                    {isMl ? 'പ്രത്യേകിച്ച് രാവിലെയും രാത്രിയും.' : 'Prevent thermal inversion smoke ingress.'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold" aria-hidden="true">✓</span>
                  <span>
                    <strong>{isMl ? 'ഹെപ്പാ പ്യൂരിഫയർ ഓൺ ചെയ്യുക:' : 'HEPA Purifier continuous boost:'}</strong>{' '}
                    {isMl ? 'മുറിക്കുള്ളിൽ ഹൈ/മീഡിയം മോഡിൽ പ്രവർത്തിപ്പിക്കുക.' : 'Run fan speed at medium-high in sealed rooms.'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 font-bold" aria-hidden="true">✕</span>
                  <span>
                    <strong>{isMl ? 'പുക ഉണ്ടാക്കരുത്:' : 'Zero combustion indoors:'}</strong>{' '}
                    {isMl ? 'ചന്ദനത്തിരിയോ കൊതുകുതിരിയോ കത്തിക്കരുത്.' : 'No incense, mosquito coils, or unvented frying.'}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
                <PhoneCall className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {isMl ? 'അടിയന്തര ആരോഗ്യ സഹായ നമ്പറുകൾ' : 'National Emergency & Health Helplines'}
                </div>
                <div className="text-xs text-neutral-400">
                  {isMl ? 'ആംബുലൻസ്: 108 • ദേശീയ ആരോഗ്യ ഹെൽപ്പ് ലൈൻ: 1075' : 'Medical Emergency: 108 / 112 • National Health Helpline: 1075'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl transition text-sm shadow-lg shadow-red-900/40"
            >
              {isMl ? 'നിർദ്ദേശങ്ങൾ മനസ്സിലായി' : 'Acknowledge & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
