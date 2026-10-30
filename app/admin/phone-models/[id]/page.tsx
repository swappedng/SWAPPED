'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getPhoneModel, createPhoneModel, updatePhoneModel, type PhoneModel, type CreatePhoneModelRequest, type UpdatePhoneModelRequest } from '@/lib/api/endpoints/admin/phone-models';

interface FormData {
  label: string;
  model: string;
  storage: string;
  buyingPrice: number;
  isActive: boolean;
  order: number;
}

export default function EditPhoneModelPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isNew = id === 'new';

  const [formData, setFormData] = useState<FormData>({
    label: '',
    model: '',
    storage: '',
    buyingPrice: 0,
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    if (!isNew) {
      const fetchPhoneModel = async () => {
        try {
          const data = await getPhoneModel(id);
          setFormData(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      };
      fetchPhoneModel();
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isNew) {
        await createPhoneModel(formData as CreatePhoneModelRequest);
      } else {
        await updatePhoneModel(id, formData as UpdatePhoneModelRequest);
      }
      router.push('/admin/phone-models');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? 'Add Phone Model' : 'Edit Phone Model'}
          </h1>
          <p className="text-gray-600 mt-2">Manage phone models and base pricing</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Label (e.g., "iPhone 15 Pro 256GB")
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Model (e.g., "iPhone 15 Pro")
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Storage (e.g., "256GB")
              </label>
              <input
                type="text"
                required
                value={formData.storage}
                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Buying Price (₦)
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.buyingPrice}
                onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
              Active
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <Link
              href="/admin/phone-models"
              className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 text-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
