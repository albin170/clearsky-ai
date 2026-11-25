import React, { useState } from 'react';
import type { CommunityCreateInput, CommunityReportCreateInput } from '../../types';
import { ModalDialog } from '../common/ModalDialog';

interface ReportConcernModalProps {
  isOpen: boolean;
  currentCity: string;
  currentLat: number;
  currentLon: number;
  onClose: () => void;
  onSubmit: (data: CommunityReportCreateInput) => Promise<void>;
}

export const ReportConcernModal: React.FC<ReportConcernModalProps> = ({
  isOpen,
  currentCity,
  currentLat,
  currentLon,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('waste_burning');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: title.trim(),
      report_type: reportType,
      description: description.trim(),
      address: address.trim() || currentCity,
      latitude: currentLat,
      longitude: currentLon,
      is_anonymous: isAnonymous,
    });
    setTitle('');
    setDescription('');
    setAddress('');
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} titleId="report-modal-title">
      <div className="space-y-4">
        <div>
          <h2 id="report-modal-title" className="text-lg font-bold text-white">
            Report Neighborhood Pollution Concern
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Help identify waste burning, heavy construction dust plumes, or industrial idling.
          </p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label htmlFor="report-title" className="block text-xs font-semibold text-neutral-300 mb-1">
              Issue Title
            </label>
            <input
              id="report-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Open plastic/leaf burning in vacant lot"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />
          </div>

          <div>
            <label htmlFor="report-type" className="block text-xs font-semibold text-neutral-300 mb-1">
              Pollution Category
            </label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="waste_burning">Open Waste / Leaf Burning</option>
              <option value="construction_dust">Uncovered Construction Dust</option>
              <option value="traffic_idling">Heavy Diesel Vehicle Idling</option>
              <option value="industrial_emission">Industrial Chimney Smoke</option>
              <option value="crop_burning">Agricultural Biomass / Stubble Smoke</option>
              <option value="other">Other Environmental Concern</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-desc" className="block text-xs font-semibold text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              id="report-desc"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe location details, time of day, and smoke intensity..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />
          </div>

          <div>
            <label htmlFor="report-address" className="block text-xs font-semibold text-neutral-300 mb-1">
              Street Address / Landmark
            </label>
            <input
              id="report-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Ring Road Junction, Sector 4"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="anonCheck"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 bg-neutral-950 border-neutral-700"
            />
            <label htmlFor="anonCheck" className="text-xs text-neutral-300 cursor-pointer">
              Submit report anonymously
            </label>
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
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
};

interface CompleteChallengeModalProps {
  challengeId: number | null;
  onClose: () => void;
  onComplete: (challengeId: number, notes: string) => Promise<void>;
}

export const CompleteChallengeModal: React.FC<CompleteChallengeModalProps> = ({
  challengeId,
  onClose,
  onComplete,
}) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (challengeId === null) return;
    await onComplete(challengeId, notes);
    setNotes('');
  };

  return (
    <ModalDialog isOpen={challengeId !== null} onClose={onClose} titleId="challenge-modal-title">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <h2 id="challenge-modal-title" className="text-lg font-bold text-white">
            Complete Sustainability Challenge
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Briefly describe how you completed this challenge to earn verified Eco Points.
          </p>
        </div>

        <div>
          <label htmlFor="challenge-notes" className="block text-xs font-semibold text-neutral-300 mb-1">
            Completion Notes
          </label>
          <textarea
            id="challenge-notes"
            rows={3}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Took the metro for 5 days instead of driving my car, avoided ~12 kg CO2!"
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
            className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
          >
            Claim Eco Points
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};

interface CreateCoalitionModalProps {
  isOpen: boolean;
  currentCity: string;
  onClose: () => void;
  onCreate: (data: CommunityCreateInput) => Promise<void>;
}

export const CreateCoalitionModal: React.FC<CreateCoalitionModalProps> = ({
  isOpen,
  currentCity,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('neighborhood');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      name: name.trim(),
      city: currentCity,
      description: description.trim(),
      category,
    });
    setName('');
    setDescription('');
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} titleId="coalition-modal-title">
      <div className="space-y-4">
        <h2 id="coalition-modal-title" className="text-lg font-bold text-white">
          Start New Neighborhood Coalition
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label htmlFor="coalition-name" className="block text-xs font-semibold text-neutral-300 mb-1">
              Coalition Name
            </label>
            <input
              id="coalition-name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. South Green Corridor Network"
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            />
          </div>

          <div>
            <label htmlFor="coalition-category" className="block text-xs font-semibold text-neutral-300 mb-1">
              Category
            </label>
            <select
              id="coalition-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white"
            >
              <option value="neighborhood">Neighborhood Resident Association</option>
              <option value="school_college">School / College Campus</option>
              <option value="workplace">Office / Workplace Alliance</option>
              <option value="environmental_club">Eco Cycling / Environmental Club</option>
            </select>
          </div>

          <div>
            <label htmlFor="coalition-desc" className="block text-xs font-semibold text-neutral-300 mb-1">
              Mission Description
            </label>
            <textarea
              id="coalition-desc"
              required
              minLength={5}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your coalition's clean air activities..."
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
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
            >
              Establish Coalition
            </button>
          </div>
        </form>
      </div>
    </ModalDialog>
  );
};
