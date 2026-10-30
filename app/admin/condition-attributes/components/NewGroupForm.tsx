import { type GroupFormData } from './types';

interface Props {
  formData: GroupFormData;
  onChange: (data: GroupFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function NewGroupForm({ formData, onChange, onSubmit, onCancel }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Label</label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => onChange({ ...formData, label: e.target.value })}
              placeholder="e.g. Screen condition"
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Group description…"
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] bg-white focus:ring-2 focus:ring-gray-900 outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-1.5 text-[11px] font-semibold bg-gray-950 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Create group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
