"use client";

import { useEffect, type ReactNode } from "react";

export interface ConfirmBoxProps {
  isOpen?: boolean;
  title?: string;
  message?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function ConfirmBox({
  isOpen = true,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm = () => {},
  onCancel = () => {},
}: ConfirmBoxProps) {
  // Listen for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-box-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl transition-all sm:p-7">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
              isDestructive
                ? "bg-rose-500/20 text-rose-400"
                : "bg-teal-500/20 text-teal-400"
            }`}
          >
            {isDestructive ? "⚠️" : "❓"}
          </div>

          <div className="flex-1">
            <h2
              id="confirm-box-title"
              className="text-lg font-bold tracking-tight text-white"
            >
              {title}
            </h2>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              {message}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-400 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 active:scale-100 cursor-pointer ${
              isDestructive
                ? "bg-rose-600 text-white shadow-rose-600/30 hover:bg-rose-500 focus-visible:outline-rose-400"
                : "bg-gradient-to-r from-teal-400 to-sky-500 text-slate-950 shadow-teal-500/30 focus-visible:outline-teal-400"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}