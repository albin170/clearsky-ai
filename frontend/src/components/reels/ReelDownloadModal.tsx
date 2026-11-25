import React from 'react';
import { Copy, Download, Music2, Video, X } from 'lucide-react';
import type { Reel } from '../../types';
import { ModalDialog } from '../common/ModalDialog';

interface ReelDownloadModalProps {
  isOpen: boolean;
  currentReel: Reel;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ReelDownloadModal: React.FC<ReelDownloadModalProps> = ({
  isOpen,
  currentReel,
  onClose,
  onShowToast,
}) => {
  const videoUrl = currentReel.video_url || '/videos/outdoor-jogging.mp4';
  const audioUrl = currentReel.audio_url || '/audio/reel-track-1.mp3';

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      titleId="download-modal-title"
      panelClassName="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-2xl text-white"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Download className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="download-modal-title" className="font-extrabold text-base text-white">
              Download Media Files
            </h2>
            <p className="text-xs text-neutral-400">Direct MP4 Video &amp; MP3 Audio Downloads</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close download modal"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-1">
        <span className="text-[10px] uppercase font-bold text-teal-400">Selected Reel</span>
        <h3 className="text-sm font-bold text-white">{currentReel.title}</h3>
        <p className="text-xs text-neutral-400">
          {currentReel.creator_name} ({currentReel.creator_handle})
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/60 to-neutral-900 border border-teal-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300">
              <Video className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">High-Definition MP4 Video</div>
              <p className="text-[11px] text-neutral-400 font-mono">{videoUrl}</p>
            </div>
          </div>
          <a
            href={videoUrl}
            download={`${currentReel.id}-video.mp4`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save MP4</span>
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-neutral-900 border border-purple-500/30 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300">
              <Music2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Original MP3 Audio Track</div>
              <p className="text-[11px] text-neutral-400 font-mono">{audioUrl}</p>
            </div>
          </div>
          <a
            href={audioUrl}
            download={`${currentReel.id}-audio.mp3`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save MP3</span>
          </a>
        </div>
      </div>

      <div className="pt-2 flex justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(`${window.location.origin}${videoUrl}`);
            onShowToast('Direct MP4 URL copied!');
          }}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition font-medium"
        >
          <Copy className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
          <span>Copy MP4 URL</span>
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(`${window.location.origin}${audioUrl}`);
            onShowToast('Direct MP3 URL copied!');
          }}
          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition font-medium"
        >
          <Copy className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
          <span>Copy MP3 URL</span>
        </button>
      </div>
    </ModalDialog>
  );
};
