import React, { useState } from 'react';
import type { RoomAssessmentCreateInput } from '../../types';
import { ModalDialog } from '../common/ModalDialog';

interface RoomAssessmentModalProps {
  isOpen: boolean;
  defaultRoomSize: number;
  onClose: () => void;
  onCreate: (input: RoomAssessmentCreateInput) => Promise<void>;
}

export const RoomAssessmentModal: React.FC<RoomAssessmentModalProps> = ({
  isOpen,
  defaultRoomSize,
  onClose,
  onCreate,
}) => {
  const [roomName, setRoomName] = useState('Master Bedroom');
  const [roomSize, setRoomSize] = useState(defaultRoomSize);
  const [occupants, setOccupants] = useState(2);
  const [ventilationType, setVentilationType] = useState('cross_windows');
  const [hasPurifier, setHasPurifier] = useState(true);
  const [filterType, setFilterType] = useState('hepa_h13');
  const [cookingExposure, setCookingExposure] = useState('low');
  const [sensorPm25, setSensorPm25] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      room_name: roomName.trim(),
      room_size_sqft: Number(roomSize),
      occupants: Number(occupants),
      ventilation_type: ventilationType,
      has_purifier: hasPurifier,
      purifier_filter_type: filterType,
      cooking_smoke_exposure: cookingExposure,
      sensor_pm25: sensorPm25 ? Number(sensorPm25) : undefined,
    });
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} titleId="indoor-modal-title">
      <div className="space-y-4">
        <h2 id="indoor-modal-title" className="text-lg font-bold text-white">
          Room Health Planner
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label htmlFor="indoor-room-name" className="block text-xs font-semibold text-neutral-300 mb-1">
              Room Name
            </label>
            <input
              id="indoor-room-name"
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Master Bedroom, Living Room, etc."
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="indoor-room-size" className="block text-xs font-semibold text-neutral-300 mb-1">
                Area (sq ft)
              </label>
              <input
                id="indoor-room-size"
                type="number"
                required
                min={10}
                max={50000}
                value={roomSize}
                onChange={(e) => setRoomSize(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
              />
            </div>
            <div>
              <label htmlFor="indoor-occupants" className="block text-xs font-semibold text-neutral-300 mb-1">
                Occupants
              </label>
              <input
                id="indoor-occupants"
                type="number"
                required
                min={1}
                max={500}
                value={occupants}
                onChange={(e) => setOccupants(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="indoor-ventilation" className="block text-xs font-semibold text-neutral-300 mb-1">
              Ventilation Architecture
            </label>
            <select
              id="indoor-ventilation"
              value={ventilationType}
              onChange={(e) => setVentilationType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="cross_windows">Cross-ventilation (Opposing Windows)</option>
              <option value="single_window">Single Window Only</option>
              <option value="sealed_ac">Sealed Room with Air Conditioner</option>
              <option value="exhaust_only">Exhaust Fan Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <input
              type="checkbox"
              id="hasPurifier"
              checked={hasPurifier}
              onChange={(e) => setHasPurifier(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-neutral-950 border-neutral-700"
            />
            <label htmlFor="hasPurifier" className="text-xs font-semibold text-neutral-200 cursor-pointer">
              Air Purifier is Installed
            </label>
          </div>

          {hasPurifier && (
            <div>
              <label htmlFor="indoor-filter-type" className="block text-xs font-semibold text-neutral-300 mb-1">
                Filter Grade
              </label>
              <select
                id="indoor-filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
              >
                <option value="hepa_h13">Certified HEPA H13 (99.97% 0.3µm)</option>
                <option value="basic">Standard Coarse Mesh Filter</option>
                <option value="carbon">Activated Carbon Deodorizing Filter</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="indoor-cooking-exposure" className="block text-xs font-semibold text-neutral-300 mb-1">
              Cooking Smoke Infiltration
            </label>
            <select
              id="indoor-cooking-exposure"
              value={cookingExposure}
              onChange={(e) => setCookingExposure(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="low">Low (Far from kitchen or chimney installed)</option>
              <option value="moderate">Moderate (Nearby open kitchen)</option>
              <option value="high">High (No chimney, regular frying/tadka smoke)</option>
            </select>
          </div>

          <div>
            <label htmlFor="indoor-sensor-pm25" className="block text-xs font-semibold text-neutral-300 mb-1">
              Optional Physical Sensor PM2.5 (µg/m³)
            </label>
            <input
              id="indoor-sensor-pm25"
              type="number"
              min={0}
              max={2000}
              step={0.1}
              value={sensorPm25}
              onChange={(e) => setSensorPm25(e.target.value)}
              placeholder="e.g. 22.5 (leave blank if no sensor)"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-900/30"
            >
              Compute Health Index
            </button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
};
