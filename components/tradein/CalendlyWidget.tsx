"use client";

import { useEffect } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { SwapMethod } from '@/lib/api/types/enums';

interface CalendlyWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  swapId: string;
  swapMethod: SwapMethod | '';
  email: string;
  onScheduled: () => void;
}

export default function CalendlyWidget({ isOpen, onClose, swapId, swapMethod, email, onScheduled }: CalendlyWidgetProps) {
  useCalendlyEventListener({
    onEventScheduled: () => onScheduled(),
  });

  useEffect(() => {
    // Close modal on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="apple-title text-gray-900">
              Schedule Your{" "}
              {swapMethod && swapMethod !== SwapMethod.WALK_IN ? "Pickup" : "Appointment"}
            </h2>
            <p className="apple-body text-gray-600 mt-1">
              {swapMethod !== SwapMethod.WALK_IN
                ? "Choose a convenient time for our expert to pick up your device"
                : "Choose a convenient time from our live business calendar"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Calendly Widget */}
        <div className="h-[600px] overflow-hidden">
          <InlineWidget
            url="https://calendly.com/swapped-ng/new-meeting"
            styles={{
              height: "600px",
              width: "100%",
            }}
            prefill={{
              name: "Upgrade Enthusiast",
              email,
              customAnswers: {
                a1: swapId, // This maps to your first custom question
                a2: swapMethod, // This maps to your second custom question
              },
            }}
            utm={{
              utmSource: "swapped-app",
              utmMedium: "inline-widget",
              utmCampaign: "phone-swap",
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="apple-footnote text-gray-600">
              Having trouble?{" "}
              <a
                href="mailto:support@swapped.ng"
                className="text-blue-600 hover:text-blue-700"
              >
                Contact support
              </a>
            </p>
            <button onClick={onClose} className="apple-button-secondary px-6">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
