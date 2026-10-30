'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConditionAttributeGroup {
  id: string;
  key: string;
  label: string;
  description: string | null;
  order: number;
  isActive: boolean;
  options: Array<{
    id: string;
    value: string;
    label: string;
    priceModifier: number;
    isActive: boolean;
  }>;
}

interface FormData {
  key: string;
  label: string;
  description: string;
  order: number;
  isActive: boolean;
}

export default function EditConditionAttributeGroupPage({
  params,
}: {
  params: { groupKey: string };
}) {
  const router = useRouter();
  const { groupKey } = params;
  const isNew = groupKey === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<ConditionAttributeGroup | null>(null);
  const [formData, setFormData] = useState<FormData>({
    key: '',
    label: '',
    description: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isNew) return;

      try {
        // Get group data directly using the new API route
        const response = await fetch(`/api/admin/condition-attributes/${groupKey}`);
        if (response.ok) {
          const groupData = await response.json();
          setGroup(groupData);
          setFormData({
            key: groupData.key,
            label: groupData.label,
            description: groupData.description || '',
            order: groupData.order,
            isActive: groupData.isActive,
          });
        } else {
          console.error('Group not found');
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupKey, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew 
        ? '/api/admin/condition-attributes/groups'
        : `/api/admin/condition-attributes/${groupKey}`;
      
      const method = isNew ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/condition-attributes');
      } else {
        console.error('Failed to save group');
      }
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/admin" className="hover:text-gray-900">Admin</Link>
          <span>/</span>
          <Link href="/admin/condition-attributes" className="hover:text-gray-900">Inspection Checklist</Link>
          <span>/</span>
          <span className="text-gray-900">{isNew ? 'New Group' : formData.label}</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'New Inspection Group' : `Edit ${formData.label}`}
        </h1>
        <p className="text-gray-600 mt-2">
          {isNew ? 'Create a new inspection checklist group' : 'Modify inspection checklist group settings'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Group Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
                Key (Identifier)
              </label>
              <input
                type="text"
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., battery, screen, body"
                required
                disabled={!isNew} // Don't allow changing key for existing groups
              />
              {!isNew && (
                <p className="text-xs text-gray-500 mt-1">Key cannot be changed for existing groups</p>
              )}
            </div>

            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
                Display Label
              </label>
              <input
                type="text"
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Battery Health, Screen Condition"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description shown to customers"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active (visible to customers)</span>
              </label>
            </div>
          </div>
        </div>

        {!isNew && group && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Options</h2>
              <Link
                href={`/admin/condition-attributes/${groupKey}/option/new`}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Add Option
              </Link>
            </div>
            
            {group.options && group.options.length > 0 ? (
              <div className="space-y-2">
                {group.options.map((option) => (
                  <div key={option.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-gray-500 ml-2">({option.value})</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {(option.priceModifier * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Link
                      href={`/admin/condition-attributes/${groupKey}/option/${option.value}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No options yet. Add some options to this group.</p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/condition-attributes"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : isNew ? 'Create Group' : 'Update Group'}
          </button>
        </div>
      </form>
    </div>
  );
}