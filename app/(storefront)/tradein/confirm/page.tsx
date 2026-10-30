"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Appointment {
    id: string;
    swapId: string;
    appointmentType: string;
    date: string;
    time: string;
    createdAt: string;
    updatedAt: string;
}

interface Swap {
    id: string;
    tradeInPhone: any;
    newPhone: any;
    tradeInValue: number;
    newPhonePrice: number;
    amountToPay: number;
    createdAt: string;
    appointment: Appointment | null;
}

function ConfirmPageContent() {
    const [swap, setSwap] = useState<Swap | null>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const swapId = searchParams.get('swapId');

    useEffect(() => {
        const fetchSwapData = async () => {
            if (swapId) {
                try {
                    const response = await fetch(`/api/swaps?swapId=${swapId}`);
                    if (response.ok) {
                        const swapData = await response.json();
                        setSwap(swapData);
                    } else {
                        console.error('Failed to fetch swap data');
                    }
                } catch (error) {
                    console.error('Failed to fetch swap data', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchSwapData();
    }, [swapId]);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="apple-card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="apple-title mb-2">Trade-in Submitted!</h1>
            <p className="apple-body text-green-600 font-medium mb-2">Thank you for choosing SWAPPED</p>
            <p className="apple-body text-gray-600">We've received your request and will send you an email to confirm your appointment. The final price will be determined after our inspection.</p>
          </div>
          
          {loading ? (
              <div className="flex items-center justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 apple-body text-gray-600">Loading swap details...</span>
              </div>
          ) : swap ? (
              <div className="space-y-6 my-8">
                {/* Swap Summary */}
                <div className="p-6 bg-gray-50 rounded-xl text-left">
                  <h3 className="apple-headline mb-4">Swap Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="apple-body text-gray-600">Trade-in Value:</span>
                      <span className="apple-body font-medium">₦{swap.tradeInValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="apple-body text-gray-600">New Phone Price:</span>
                      <span className="apple-body font-medium">₦{swap.newPhonePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="apple-body text-gray-900 font-medium">Amount to Pay:</span>
                      <span className="apple-body font-bold text-blue-600">₦{swap.amountToPay.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details (if scheduled) */}
                {swap.appointment && (
                  <div className="p-6 bg-green-50 rounded-xl text-left">
                    <h3 className="apple-headline mb-4">Appointment Scheduled</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="apple-body text-gray-600">Type:</span>
                        <span className="apple-body font-medium">{swap.appointment.appointmentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="apple-body text-gray-600">Date:</span>
                        <span className="apple-body font-medium">{new Date(swap.appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="apple-body text-gray-600">Time:</span>
                        <span className="apple-body font-medium">{swap.appointment.time}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Contact Information */}
                {swap.tradeInPhone.contactEmail && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="apple-footnote text-blue-800">
                      We'll send updates to: <strong>{swap.tradeInPhone.contactEmail}</strong>
                    </p>
                  </div>
                )}
              </div>
          ) : (
              <div className="my-8 p-6 bg-yellow-50 rounded-xl">
                <p className="apple-body text-yellow-800">Could not retrieve swap details at this time.</p>
              </div>
          )}

          <Link href="/tradein">
            <a className="apple-button-primary inline-block">Start New Trade-in</a>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    // I could add a loading.tsx so my fallback can be a skeleton loader instead of just "Loading..."
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
