'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Plus, Save } from 'lucide-react';
import {
  getAvailabilityBlocks,
  createAvailabilityBlock,
  updateAvailabilityBlock,
  deleteAvailabilityBlock,
} from '@/lib/api/endpoints/admin/availability';
import { type AvailabilityBlock } from '@/lib/api/types/tradein';

const DEFAULT_START_HOUR = 8; // 8 AM
const DEFAULT_END_HOUR = 18; // 6 PM

export default function AvailabilityPage() {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    isUnavailable: false,
    unavailableStartHour: null as number | null,
    unavailableEndHour: null as number | null,
  });

  const load = async () => {
    try {
      const data = await getAvailabilityBlocks();
      setBlocks(data);
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getBlockForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return blocks.find((b) => b.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingBlock = getBlockForDate(date);

    setEditingDate(dateStr);
    if (existingBlock) {
      setEditForm({
        isUnavailable: existingBlock.isUnavailable,
        unavailableStartHour: existingBlock.unavailableStartHour ?? null,
        unavailableEndHour: existingBlock.unavailableEndHour ?? null,
      });
    } else {
      setEditForm({
        isUnavailable: false,
        unavailableStartHour: null,
        unavailableEndHour: null,
      });
    }
  };

  const handleSave = async () => {
    if (!editingDate) return;

    setSaving(true);
    try {
      const existingBlock = getBlockForDate(new Date(editingDate));

      if (editForm.isUnavailable === false && !editForm.unavailableStartHour && !editForm.unavailableEndHour) {
        // If everything is default, delete the block if it exists
        if (existingBlock) {
          await deleteAvailabilityBlock(existingBlock.id);
        }
      } else if (existingBlock) {
        // Update existing block
        await updateAvailabilityBlock(existingBlock.id, editForm);
      } else {
        // Create new block
        await createAvailabilityBlock({
          date: editingDate,
          ...editForm,
        });
      }

      await load();
      setEditingDate(null);
    } catch (error) {
      console.error('Failed to save availability:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingDate(null);
    setEditForm({
      isUnavailable: false,
      unavailableStartHour: null,
      unavailableEndHour: null,
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Availability</h1>
          <p className="mt-1 text-sm text-slate-500">
            Default: 8 AM - 6 PM WAT, Monday - Friday. Mark days as unavailable or block specific hours.
          </p>
        </div>
      </header>

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="rounded-lg p-2 hover:bg-stone-100"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-lg font-semibold text-slate-950 min-w-[200px] text-center">
              {monthYear}
            </h2>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-2 hover:bg-stone-100"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium text-slate-500">
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />;
            }

            const block = getBlockForDate(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = date.toDateString() === new Date().toDateString();
            const isUnavailable = block?.isUnavailable;
            const hasPartialBlock = block?.unavailableStartHour || block?.unavailableEndHour;

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  aspect-square rounded-lg border p-1 text-sm transition hover:bg-stone-50
                  ${isToday ? 'border-slate-900' : 'border-stone-200'}
                  ${isUnavailable ? 'bg-rose-50 border-rose-200' : ''}
                  ${hasPartialBlock && !isUnavailable ? 'bg-amber-50 border-amber-200' : ''}
                  ${isWeekend ? 'bg-stone-50 text-slate-400' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={isToday ? 'font-semibold' : ''}>{date.getDate()}</span>
                  {isUnavailable && <span className="text-[10px] text-rose-600 mt-0.5">Unavailable</span>}
                  {hasPartialBlock && !isUnavailable && <span className="text-[10px] text-amber-600 mt-0.5">Limited</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {editingDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-950">
                {new Date(editingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button
                onClick={handleCancel}
                className="rounded-lg p-2 hover:bg-stone-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isUnavailable"
                  checked={editForm.isUnavailable}
                  onChange={(e) => setEditForm({ ...editForm, isUnavailable: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300"
                />
                <label htmlFor="isUnavailable" className="text-sm font-medium text-slate-900">
                  Mark entire day as unavailable
                </label>
              </div>

              {!editForm.isUnavailable && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">Block specific hours (optional):</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        From (hour)
                      </label>
                      <select
                        value={editForm.unavailableStartHour ?? ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            unavailableStartHour: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                      >
                        <option value="">--</option>
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        To (hour)
                      </label>
                      <select
                        value={editForm.unavailableEndHour ?? ''}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            unavailableEndHour: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                      >
                        <option value="">--</option>
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
