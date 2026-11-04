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
    </div>
  );
}
