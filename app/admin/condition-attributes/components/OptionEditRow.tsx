import { type OptionEdit } from './types';

interface Props {
  option: any;
  edits: OptionEdit;
  onChange: (id: string, edits: OptionEdit) => void;
}

export function OptionEditRow({ option, edits, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2.5 px-4 py-4 rounded-lg border border-gray-200 bg-gray-50">
      {/* Line 1: label */}
      <input
        type="text"
        value={edits.label}
        onChange={(e) => onChange(option.id, { ...edits, label: e.target.value })}
        placeholder="Label"
        className="w-full bg-transparent text-[13px] font-semibold text-gray-800 placeholder:text-gray-400 border-none outline-none focus:bg-white focus:px-1.5 focus:rounded focus:ring-1 focus:ring-gray-300 transition-all"
      />
      {/* Line 2: description */}
      <textarea
        value={edits.description}
        onChange={(e) => onChange(option.id, { ...edits, description: e.target.value })}
        placeholder="Description (optional)"
        rows={3}
        className="w-full bg-transparent text-xs text-gray-500 placeholder:text-gray-300 border-none outline-none focus:bg-white focus:px-1.5 focus:rounded focus:ring-1 focus:ring-gray-300 transition-all resize-none leading-relaxed"
      />
      {/* Line 3: deduction full width */}
      <div className="flex items-center gap-2">
        <select
          value={edits.modifierType}
          onChange={(e) => onChange(option.id, { ...edits, modifierType: e.target.value })}
          className="h-7 px-2 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 bg-white outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer shrink-0"
        >
          <option value="AMOUNT">₦ Flat</option>
          <option value="PERCENTAGE">% Percent</option>
        </select>
        <input
          type="number"
          step="any"
          value={edits.priceModifier}
          onChange={(e) => onChange(option.id, { ...edits, priceModifier: parseFloat(e.target.value) || 0 })}
          className="flex-1 min-w-0 h-7 px-2 border border-gray-200 rounded-md text-[12px] font-bold text-gray-900 bg-white outline-none focus:ring-1 focus:ring-gray-900 text-right"
        />
      </div>
    </div>
  );
}
