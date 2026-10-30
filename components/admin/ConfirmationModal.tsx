'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, Loader2, Trash2, X } from 'lucide-react';

export type ConfirmationType = 'danger' | 'warning' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  subtitle?: React.ReactNode;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string | null;
}

const TYPE_CONFIG = {
  danger: {
    icon: Trash2,
    iconWrapper: 'bg-rose-50 text-rose-600 border-rose-100',
    confirmButton: 'bg-rose-600 text-white hover:bg-rose-700',
    defaultConfirmText: 'Delete',
  },
  warning: {
    icon: AlertTriangle,
    iconWrapper: 'bg-amber-50 text-amber-600 border-amber-100',
    confirmButton: 'bg-amber-600 text-white hover:bg-amber-700',
    defaultConfirmText: 'Confirm',
  },
  info: {
    icon: Info,
    iconWrapper: 'bg-violet-50 text-violet-600 border-violet-100',
    confirmButton: 'bg-gray-950 text-white hover:bg-gray-800',
    defaultConfirmText: 'Continue',
  },
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  type = 'danger',
  confirmText,
  cancelText = 'Cancel',
  isLoading: externalLoading,
  error,
}: ConfirmationModalProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  if (!isOpen) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.danger;
  const Icon = config.icon;
  const isLoading = externalLoading ?? internalLoading;
  const actionLabel = confirmText || config.defaultConfirmText;

  const handleConfirm = async () => {
    try {
      const result = onConfirm();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${config.iconWrapper}`}>
            <Icon size={22} />
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-950">{title}</h3>
          {subtitle && (
            <div className="mt-2 text-sm text-gray-600 leading-relaxed">
              {subtitle}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-100">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 shadow-sm ${config.confirmButton}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <span>{actionLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
