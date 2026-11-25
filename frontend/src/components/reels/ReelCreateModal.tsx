import React, { useState } from 'react';
import { Video, X } from 'lucide-react';
import type { Reel } from '../../types';
import { ModalDialog } from '../common/ModalDialog';

const REEL_CATEGORIES: readonly Reel['category'][] = ['smog_alert', 'health', 'home_hacks', 'stubble_fire', 'tech'];

function isReelCategory(value: string): value is Reel['category'] {
  return (REEL_CATEGORIES as readonly string[]).includes(value);
}

export interface NewReelFormInput {
  title: string;
  caption: string;
  category: Reel['category'];
  takeaway: string;
  tags: string;
  videoUrl: string;
  audioUrl: string;
}

interface ReelCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReel: (input: NewReelFormInput) => Promise<void>;
}

export const ReelCreateModal: React.FC<ReelCreateModalProps> = ({ isOpen, onClose, onCreateReel }) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<Reel['category']>('health');
  const [takeaway, setTakeaway] = useState('');
  const [tags, setTags] = useState('#CleanAir, #BreatheSafe');
  const [videoUrl, setVideoUrl] = useState('/videos/outdoor-jogging.mp4');
  const [audioUrl, setAudioUrl] = useState('/audio/reel-track-1.mp3');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caption.trim()) return;
    await onCreateReel({ title, caption, category, takeaway, tags, videoUrl, audioUrl });
    setTitle('');
    setCaption('');
    setTakeaway('');
  };

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} titleId="create-reel-modal-title">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <h2 id="create-reel-modal-title" className="font-extrabold text-base text-white flex items-center space-x-2">
          <Video className="w-5 h-5 text-teal-400" aria-hidden="true" />
          <span>Post Community Eco Reel</span>
        </h2>
        <button
          type="button"
          aria-label="Close create reel modal"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 text-xs">
        <div>
          <label htmlFor="create-reel-title" className="block text-neutral-300 font-bold mb-1">
            Reel Title
          </label>
          <input
            id="create-reel-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 3 Quick Checks Before Letting Kids Play Outside"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label htmlFor="create-reel-video" className="block text-neutral-300 font-bold mb-1">
            Select MP4 Video Clip
          </label>
          <select
            id="create-reel-video"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="/videos/outdoor-jogging.mp4">Outdoor Jogging &amp; Smog Morning (/videos/outdoor-jogging.mp4)</option>
            <option value="/videos/traffic-smog.mp4">City Traffic &amp; Vehicle Exhaust (/videos/traffic-smog.mp4)</option>
            <option value="/videos/nature-clean-air.mp4">NASA Clean Air Blooming Nature (/videos/nature-clean-air.mp4)</option>
            <option value="/videos/fluid-diffusion.mp4">Micro-Particulate Aerosol Flow (/videos/fluid-diffusion.mp4)</option>
          </select>
        </div>

        <div>
          <label htmlFor="create-reel-audio" className="block text-neutral-300 font-bold mb-1">
            Select MP3 Audio Track
          </label>
          <select
            id="create-reel-audio"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="/audio/reel-track-1.mp3">Lo-Fi Chill Environmental Sound (Track 1)</option>
            <option value="/audio/reel-track-2.mp3">Deep Electro Lab Synth (Track 2)</option>
            <option value="/audio/reel-track-3.mp3">Acoustic Nature Groove (Track 3)</option>
          </select>
        </div>

        <div>
          <label htmlFor="create-reel-category" className="block text-neutral-300 font-bold mb-1">
            Category
          </label>
          <select
            id="create-reel-category"
            value={category}
            onChange={(e) => {
              if (isReelCategory(e.target.value)) setCategory(e.target.value);
            }}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
          >
            <option value="smog_alert">Smog Alert</option>
            <option value="health">Health &amp; Lungs</option>
            <option value="home_hacks">Home &amp; Purifier Hacks</option>
            <option value="stubble_fire">Stubble &amp; Satellite</option>
            <option value="tech">Tech &amp; Masks</option>
          </select>
        </div>

        <div>
          <label htmlFor="create-reel-caption" className="block text-neutral-300 font-bold mb-1">
            Caption
          </label>
          <textarea
            id="create-reel-caption"
            required
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Explain the science, danger, or solution in plain language..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 resize-none"
          />
        </div>

        <div>
          <label htmlFor="create-reel-takeaway" className="block text-neutral-300 font-bold mb-1">
            Key Takeaway Hook
          </label>
          <input
            id="create-reel-takeaway"
            type="text"
            value={takeaway}
            onChange={(e) => setTakeaway(e.target.value)}
            placeholder="e.g. Wear N95 when AQI crosses 200"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label htmlFor="create-reel-tags" className="block text-neutral-300 font-bold mb-1">
            Hashtags (comma separated)
          </label>
          <input
            id="create-reel-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="pt-2 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition"
          >
            Publish Reel
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};
