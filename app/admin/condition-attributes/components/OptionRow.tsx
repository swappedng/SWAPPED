interface Props {
  option: any;
}

export function OptionRow({ option }: Props) {
  return (
    <div className="relative flex items-center justify-between gap-6 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Left: label + description */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-gray-800">{option.label}</p>
        {option.description && (
          <p className="text-[11px] text-gray-500 mt-0.5">{option.description}</p>
        )}
      </div>
    </div>
  );
}
