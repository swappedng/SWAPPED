"use client";

import Link from 'next/link';

// Get this options from the admin backend, for now hardcode them
const swapOptions = [
  { value: 'premium_used', label: 'Premium Used Grade A iPhones' },
  { value: 'open_box', label: 'Open Box Brand New (Active)' },
  { value: 'brand_new', label: 'Brand New iPhones (Non-active)' },
];

export default function PickPhonePage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-neutral-800 rounded-2xl shadow-2xl p-8 text-center border border-neutral-700">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">Pick Phone to Swap To</h1>
        <div className="space-y-4 mb-8">
          {swapOptions.map(opt => (
            <button key={opt.value} className="w-full bg-purple-700 hover:bg-neon-green text-white font-bold py-2 px-4 rounded transition border-2 border-neon-green mb-2">
              {opt.label}
            </button>
          ))}
        </div>
        <Link href="/tradein/swap-breakdown">
          <a className="bg-neon-green hover:bg-purple-700 text-black font-bold py-2 px-6 rounded transition border-2 border-purple-700">Next: See Swap Breakdown</a>
        </Link>
      </div>
      <style jsx global>{`
        .bg-neon-green { background-color: #39ff14; }
        .border-neon-green { border-color: #39ff14; }
      `}</style>
    </div>
  );
}
