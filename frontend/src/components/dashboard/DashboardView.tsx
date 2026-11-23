import React from 'react';
import { AQIGauge } from './AQIGauge';
import { PollutantGrid } from './PollutantGrid';
import { AirQualityTodayAI } from './AirQualityTodayAI';
import { HourlyTrendChart } from './HourlyTrendChart';
import { DailyForecastList } from './DailyForecastList';
import { WeatherCorrelationCard } from './WeatherCorrelationCard';
import { LocationComparer } from './LocationComparer';
import { useLocation } from '../../context/hooks';
import { RotateCw, AlertCircle } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { isLoading, error, refreshData } = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
        <p className="text-sm text-neutral-400 font-medium">Connecting to live atmospheric sensors & reanalysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Sensor Connection Interruption</h3>
        <p className="text-sm text-neutral-300 max-w-md mx-auto">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center space-x-2 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Retry Live Query</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Prominent AI Grounded Section */}
      <AirQualityTodayAI />

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AQI Circular Gauge */}
        <div className="lg:col-span-5 flex flex-col">
          <AQIGauge />
        </div>

        {/* Right Column: Pollutant Breakdowns */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <PollutantGrid />
        </div>
      </div>

      {/* Hourly 24-hr Diurnal Trend Chart */}
      <HourlyTrendChart />

      {/* Weather & Inversion Dynamics Correlation */}
      <WeatherCorrelationCard />

      {/* 7-Day Atmospheric Outlook */}
      <DailyForecastList />

      {/* Side-by-side Regional Airshed Comparison */}
      <LocationComparer />
    </div>
  );
};
