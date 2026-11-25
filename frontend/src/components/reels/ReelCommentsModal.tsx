import React, { useState } from 'react';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import type { Reel } from '../../types';
import { ModalDialog } from '../common/ModalDialog';

interface ReelCommentsModalProps {
  isOpen: boolean;
  currentReel: Reel;
  onClose: () => void;
  onSubmitComment: (text: string) => Promise<void>;
}

export const ReelCommentsModal: React.FC<ReelCommentsModalProps> = ({
  isOpen,
  currentReel,
  onClose,
  onSubmitComment,
}) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    setCommentText('');
    await onSubmitComment(trimmed);
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      titleId="comments-modal-title"
      backdropClassName="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
      panelClassName="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] flex flex-col justify-between shadow-2xl text-white"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-teal-400" aria-hidden="true" />
          <h2 id="comments-modal-title" className="font-extrabold text-sm text-white">
            Comments ({currentReel.comments_count})
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close comments drawer"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
        {currentReel.comments.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            No comments yet. Be the first to share your insights!
          </div>
        ) : (
          currentReel.comments.map((c) => (
            <div key={c.id} className="flex space-x-3 items-start">
              <img
                src={c.avatar}
                alt={`${c.author} avatar`}
                className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{c.author}</span>
                  <span className="text-[10px] text-neutral-400">{c.timestamp}</span>
                </div>
                <p className="text-neutral-200 mt-1 leading-relaxed">{c.text}</p>
                <div className="flex items-center space-x-4 mt-1.5 text-[10px] text-neutral-400">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" aria-hidden="true" />
                    <span>{c.likes}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="pt-3 border-t border-neutral-800 mt-3 flex items-center space-x-2">
        <label htmlFor="reel-comment-input" className="sr-only">
          Add a comment
        </label>
        <input
          id="reel-comment-input"
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment or question..."
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          aria-label="Post comment"
          className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </ModalDialog>
  );
};
