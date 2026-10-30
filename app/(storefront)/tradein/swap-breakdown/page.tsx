"use client";

import Link from 'next/link';

export default function SwapBreakdownPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-neutral-800 rounded-2xl shadow-2xl p-8 text-center border border-neutral-700">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">Swap Estimate & Breakdown</h1>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neon-green mb-2">Swap Calculation Breakdown</h2>
          <ul className="text-left text-gray-300 mb-4">
            <li>• Your current phone value and selected swap phone are compared using our algorithm.</li>
            <li>• All deductions and bonuses are transparently shown here.</li>
            <li>• Final swap value is calculated for you.</li>
          </ul>
          <div className="bg-neutral-900 border border-neon-green rounded-lg p-4 mb-4">
            <p className="text-neon-green font-bold">₦[Swap Value]</p>
          </div>
          <div className="text-xs text-gray-400 text-left">
            <strong>Note:</strong><br />
            1. Swap value not valid if details given are not accurate to phone when checked.<br />
            2. Swap value only valid for the next 5 working days.
          </div>
        </div>
        <Link href="/tradein/schedule" legacyBehavior>
          <a className="bg-neon-green hover:bg-purple-700 text-black font-bold py-2 px-6 rounded transition border-2 border-purple-700">Next: Schedule Appointment</a>
        </Link>
      </div>
      <style jsx global>{`
        .text-neon-green { color: #39ff14; }
        .bg-neon-green { background-color: #39ff14; }
        .border-neon-green { border-color: #39ff14; }
      `}</style>
    </div>
  );
}
