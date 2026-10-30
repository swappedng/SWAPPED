import { Minus } from 'lucide-react';

interface Props {
  option: any;
}

export function OptionRow({ option }: Props) {
  const deductionValue = Number(option.priceModifier);
  const isZero = deductionValue === 0;

  return (
    <div className="relative flex items-center justify-between gap-6 px-3 py-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Left: label + description */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-gray-800">{option.label}</p>
        {option.description && (
          <p className="text-[11px] text-gray-500 mt-0.5">{option.description}</p>
        )}
      </div>

      {/* Right: deduction badge */}
      <div className="flex items-center shrink-0">
        {isZero ? (
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-gray-600 bg-gray-100 rounded border border-gray-200">
            Full value
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-gray-900 bg-gray-100 rounded border border-gray-200">
            <Minus className="w-2.5 h-2.5 text-gray-500" />
            {Math.abs(deductionValue).toLocaleString()}
            {option.modifierType === 'PERCENTAGE' ? '%' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
