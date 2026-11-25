import React from 'react';
import { Flame, Wind } from 'lucide-react';

export const ReelVisualBadge: React.FC<{ visualType: string }> = ({ visualType }) => {
  switch (visualType) {
    case 'inversion_layer':
      return (
        <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-amber-300 bg-black/70 border border-amber-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
          <Flame className="w-3 h-3 text-amber-400 animate-pulse" aria-hidden="true" />
          <span>Thermal Inversion Active (0-90m Ceiling)</span>
        </div>
      );
    case 'mask_microscope':
      return (
        <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-cyan-300 bg-black/70 border border-cyan-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
          <span aria-hidden="true">🔬</span>
          <span>500x Microscope: N95 vs Cloth Pores</span>
        </div>
      );
    case 'nasa_plants':
      return (
        <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-emerald-300 bg-black/70 border border-emerald-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
          <span aria-hidden="true">🌿</span>
          <span>NASA Clean Air Bio-Scrubbing</span>
        </div>
      );
    case 'purifier_cadr':
      return (
        <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-blue-300 bg-black/70 border border-blue-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
          <Wind className="w-3 h-3 text-blue-400 animate-spin" aria-hidden="true" />
          <span>Turbo CADR: 450 m³/h Turnover</span>
        </div>
      );
    case 'stubble_satellite':
      return (
        <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-orange-300 bg-black/70 border border-orange-500/40 px-2.5 py-1 rounded-full backdrop-blur-md">
          <span aria-hidden="true">🛰️</span>
          <span>Satellite Plume: NW Wind Vector</span>
        </div>
      );
    default:
      return null;
  }
};
