import React from 'react';
import { Icons } from '../Icons';

export interface ChallengeShareoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeName: string;
  /** e.g. 72 peers */
  peerCount: number;
  /** Sum of high fives across the group */
  totalHighFives: number;
  onSharePlaceholder?: () => void;
}

export const ChallengeShareoutModal: React.FC<ChallengeShareoutModalProps> = ({
  isOpen,
  onClose,
  challengeName,
  peerCount,
  totalHighFives,
  onSharePlaceholder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="shareout-title">
      <div className="absolute inset-0 bg-[var(--cds-color-grey-25)]/95 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--cds-color-grey-100)] bg-[#faf8f5] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 hover:bg-black/5"
          aria-label="Close"
        >
          <Icons.Close className="h-5 w-5 text-[var(--cds-color-grey-600)]" />
        </button>

        <div className="flex flex-1 flex-col items-center px-8 pb-8 pt-14 text-center">
          <p id="shareout-title" className="text-5xl font-bold tabular-nums text-[var(--cds-color-grey-900)]">
            {peerCount}
          </p>
          <p className="mt-2 max-w-[16rem] cds-body-secondary text-[var(--cds-color-grey-600)]">
            People learned with your group in <span className="font-semibold text-[var(--cds-color-grey-900)]">{challengeName}</span>
          </p>
          <p className="mt-6 text-3xl font-bold tabular-nums text-[var(--cds-color-grey-900)]">{totalHighFives}</p>
          <p className="mt-1 cds-body-secondary text-[var(--cds-color-grey-600)]">High fives your group gave each other</p>

          {/* Abstract celebratory shapes — Headspace-style, no external asset */}
          <div className="relative mt-8 h-40 w-full max-w-sm">
            <div className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#e8a87c]/40" />
            <div className="absolute bottom-2 left-[12%] h-16 w-16 rounded-2xl bg-[#85c1e9]/50" />
            <div className="absolute bottom-0 right-[10%] h-20 w-14 rounded-full bg-[#f4d58d]/60" />
            <div className="absolute bottom-6 left-[28%] h-10 w-10 rounded-full bg-[#c8b8e8]/70" />
            <div className="absolute bottom-4 right-[22%] h-12 w-12 rounded-full bg-[#7fcdcd]/50" />
          </div>

          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => onSharePlaceholder?.()}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--cds-border-radius-100)] bg-[var(--cds-color-blue-700)] px-5 py-2.5 cds-action-secondary text-[var(--cds-color-white)] hover:bg-[var(--cds-color-blue-800)]"
            >
              <Icons.Share className="h-4 w-4" aria-hidden />
              Share achievement
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--cds-border-radius-100)] border border-[var(--cds-color-grey-200)] px-5 py-2.5 cds-action-secondary text-[var(--cds-color-grey-975)] hover:bg-[var(--cds-color-white)]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
