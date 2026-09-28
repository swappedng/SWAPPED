'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgePercent, Plus, Info, Pencil, Trash2 } from 'lucide-react';

interface PricingRule {
  id: string;
  name: string;
  description?: string;
  baseModel: string;
  condition?: string;
  priceAdjustment: number;
  isPercentage: boolean;
  isActive: boolean;
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch('/api/admin/pricing-rules');
        if (!response.ok) throw new Error('Failed to fetch pricing rules');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Pricing rules returned an invalid response');
        setRules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load rules');
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      const response = await fetch(`/api/admin/pricing-rules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-violet-600 text-xs font-semibold uppercase tracking-wider">
            <BadgePercent className="w-4 h-4" />
            <span>Valuation Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-950 mt-1 tracking-tight">Price adjustments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Add optional fixed or percentage adjustments to calculated trade-in quotes.
          </p>
        </div>
        <Link
          href="/admin/pricing-rules/new"
          className="inline-flex items-center justify-center gap-2 bg-gray-950 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add adjustment</span>
        </Link>
      </header>

      {/* Info Card */}
      <section className="bg-gradient-to-r from-violet-50 to-indigo-50/60 border border-violet-100 rounded-xl p-4 sm:p-5 flex gap-3 text-xs leading-relaxed text-violet-950">
        <Info className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-violet-900 block text-sm">How Pricing Rules Work</span>
          <p className="text-violet-800">
            Pricing rules modify final trade-in quotes by adding fixed amounts (e.g. <span className="font-semibold">+₦10,000 promo</span>) or percentage adjustments (e.g. <span className="font-semibold">-5% market adjustment</span>) for targeted device models or conditions.
          </p>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
          {error}
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-left font-semibold">Rule Name</th>
                <th className="px-6 py-3.5 text-left font-semibold">Target Model</th>
                <th className="px-6 py-3.5 text-left font-semibold">Adjustment</th>
                <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-950">
                    <div>{rule.name}</div>
                    {rule.description && <div className="text-gray-500 text-[11px] font-normal">{rule.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono">
                    {rule.baseModel || 'All Models'}
                    {rule.condition && <span className="text-gray-400 font-sans"> • {rule.condition}</span>}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-950">
                    <span className={rule.priceAdjustment >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                      {rule.priceAdjustment > 0 ? '+' : ''}
                      {rule.isPercentage ? `${rule.priceAdjustment}%` : `₦${rule.priceAdjustment.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        rule.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link
                      href={`/admin/pricing-rules/${rule.id}`}
                      className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-950 font-medium"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rules.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 space-y-2">
            <BadgePercent className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-900 text-sm">No pricing rules configured</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Standard trade-in base costs and condition attribute percentages apply by default.
            </p>
            <Link
              href="/admin/pricing-rules/new"
              className="inline-flex items-center gap-2 bg-gray-950 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Pricing Rule</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
