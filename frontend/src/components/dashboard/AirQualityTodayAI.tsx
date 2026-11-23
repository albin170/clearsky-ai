import React, { useState } from 'react';
import { useLocation, useLanguage } from '../../context/hooks';
import { Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export const AirQualityTodayAI: React.FC = () => {
  const { airQuality, currentCity } = useLocation();
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!airQuality) return null;

  const curr = airQuality.current;
  const w = airQuality.weather;

  const summaryText =
    language === 'ml'
      ? `${currentCity}-ലെ ഇന്നത്തെ എക്യുഐ (AQI) ${curr.aqi_in} (${curr.category_in}) ആണ്. പ്രധാന മലിനീകരണ ഘടകം ${curr.dominant_pollutant} (PM2.5: ${curr.pm2_5} µg/m³). താപനില ${w.temperature_c}°C, കാറ്റിന്റെ വേഗത ${w.wind_speed_kmh} km/h. രാവിലെയും രാത്രിയും പുറത്തിറങ്ങുമ്പോൾ മാസ്ക് ധരിക്കാനും ഉച്ചസമയത്ത് ജനലുകൾ തുറന്ന് വായുസഞ്ചാരം ഉറപ്പാക്കാനും ശ്രദ്ധിക്കുക.`
      : airQuality.ai_summary;

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.lang = language === 'ml' ? 'ml-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <section
      aria-label={t('dashboard.ai_summary_title')}
      className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-neutral-900 to-emerald-950/30 border border-teal-500/30 shadow-xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">{t('dashboard.ai_summary_title')}</h2>
            <span className="text-xs text-teal-400 font-medium">Grounded Environmental Intelligence</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpeak}
          aria-pressed={isSpeaking}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
            isSpeaking
              ? 'bg-rose-600/20 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
          }`}
          title="Listen to Audio Briefing"
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Volume2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
          )}
          <span>{isSpeaking ? 'Stop Audio' : 'Listen Briefing'}</span>
        </button>
      </div>

      <p className="text-sm text-neutral-200 leading-relaxed font-normal">{summaryText}</p>

      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
          <span>Real-time synthesis grounded in CPCB NAQI breakpoints and local meteorological sensors</span>
        </span>
        <span className="font-mono text-neutral-500">Updated: Just now</span>
      </div>
    </section>
  );
};
