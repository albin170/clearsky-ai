import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Clock, Info, RotateCw, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { useLocation } from '../../context/hooks';
import type { PredictionResponse } from '../../types';

export const PredictionView: React.FC = () => {
  const { currentCity, currentLat, currentLon } = useLocation();
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrediction = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getPrediction(currentLat, currentLon, currentCity);
      setPrediction(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load atmospheric prediction windows.');
    } finally {
      setIsLoading(false);
    }
  }, [currentCity, currentLat, currentLon]);

  useEffect(() => {
    let active = true;
    api
      .getPrediction(currentLat, currentLon, currentCity)
      .then((res) => {
        if (!active) return;
        setPrediction(res);
        setError(null);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load atmospheric prediction windows.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentCity, currentLat, currentLon]);

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
        <h1 className="text-xs text-neutral-400">Computing boundary layer meteorological simulations...</h1>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div role="alert" className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" aria-hidden="true" />
        <h1 className="text-lg font-bold text-white">Prediction Model Unavailable</h1>
        <p className="text-sm text-neutral-300">{error || 'Unable to compute diurnal forecast.'}</p>
        <button
          type="button"
          onClick={() => void loadPrediction()}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center space-x-2 transition"
        >
          <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Retry Forecast</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
          <TrendingUp className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Smart Pollution Prediction Engine</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Atmospheric boundary layer modeling and diurnal human emission cycle trend estimations
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Anticipated Pollution Spikes (Next 24h)</h2>
            <div className="text-xs text-neutral-300 mt-0.5">{prediction.predicted_peaks.join(' • ')}</div>
          </div>
        </div>
        <span className="text-[11px] font-bold text-amber-300 px-3 py-1 rounded-full bg-amber-500/20 self-start sm:self-auto">
          Diurnal Model Projected
        </span>
      </div>

      <section aria-labelledby="risk-windows-heading" className="space-y-3">
        <h2 id="risk-windows-heading" className="font-extrabold text-base text-white">
          Diurnal Atmospheric Risk Windows
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prediction.windows.map((w, idx) => {
            const isSevere =
              w.risk_level.toLowerCase().includes('severe') || w.risk_level.toLowerCase().includes('high');
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                      <span>{w.time_window}</span>
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isSevere
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                    >
                      {w.risk_level}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2 my-2">
                    <span className="text-3xl font-black text-white">AQI {w.estimated_aqi}</span>
                    <span className="text-xs text-neutral-400">Confidence: {w.confidence}</span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <strong>Primary Driver:</strong> {w.primary_driver}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>Exposure Window</span>
                  <span className={isSevere ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {isSevere ? 'Avoid Cardio Outdoor' : 'Suitable for Transit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
        <h2 className="font-extrabold text-base text-white">Meteorological Inversion Correlation</h2>
        <p className="text-sm text-neutral-200 leading-relaxed">{prediction.weather_correlation_summary}</p>
        <p className="text-xs text-neutral-400 leading-relaxed pt-2 border-t border-neutral-800">
          {prediction.explanation}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p>{prediction.disclaimer}</p>
      </div>
    </div>
  );
};
