import { type OptionFormData } from './types';

interface Props {
  groupId: string;
  isNew: boolean;
  optionId?: string;
  formData: OptionFormData;
  saving: boolean;
  onChange: (data: OptionFormData) => void;
  onSubmit: (groupId: string, isNew: boolean, optionId?: string) => void;
  onCancel: () => void;
}

export function InlineOptionForm({
  groupId,
  isNew,
  optionId,
  formData,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="relative flex flex-col gap-3 px-3 py-3 rounded-lg border border-gray-200 bg-gray-50">
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Label</label>
          <input
            type="text"
            required
            value={formData.label}
            onChange={(e) => onChange({ ...formData, label: e.target.value })}
            placeholder="e.g. Cracked screen"
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
            placeholder="Short explanation shown to customers…"
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] bg-white focus:ring-2 focus:ring-gray-900 outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1">Deduction</label>
          <div className="flex gap-2">
            <select
              value={formData.modifierType}
              onChange={(e) => onChange({ ...formData, modifierType: e.target.value })}
              className="w-2/5 px-2 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-gray-900 outline-none"
            >
              <option value="AMOUNT">Flat ₦</option>
              <option value="PERCENTAGE">%</option>
            </select>
            <input
              type="number"
              step="any"
              required
              value={formData.priceModifier}
              onChange={(e) => onChange({ ...formData, priceModifier: parseFloat(e.target.value) || 0 })}
              className="w-3/5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white focus:ring-2 focus:ring-gray-900 outline-none"
              placeholder={formData.modifierType === 'PERCENTAGE' ? '15' : '15000'}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSubmit(groupId, isNew, optionId)}
          disabled={saving}
          className="px-4 py-1.5 text-[11px] font-semibold bg-gray-950 text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving…' : isNew ? 'Add option' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
