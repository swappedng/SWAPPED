'use client';

import { useMemo, useState } from 'react';
import { StepCard } from './StepCard';
import { PillSelector } from './PillSelector';
import { OptionCardList } from './OptionCardList';
import { ShieldCheck, PackageCheck, Smartphone } from 'lucide-react';
import type { PhoneSellingPrice } from '@/types/tradein';

type Option = { value: string; label: string };

const modelNumber = (name: string) => {
  const numeric = name.match(/iPhone\s+(\d+)/i)?.[1];
  if (numeric) return Number(numeric);
  if (/iPhone\s+XS/i.test(name)) return 10.2;
  if (/iPhone\s+XR/i.test(name)) return 10.1;
  if (/iPhone\s+X/i.test(name)) return 10;
  return -1;
};

const modelGroup = (name: string) =>
  name.match(/iPhone\s+(\d+)/i)?.[1] ||
  name.match(/iPhone\s+(XS|XR|X)/i)?.[1] ||
  '';

export function UpgradeCategoryStep({
  options,
  value,
  onSelect,
  onContinue,
  onBack,
}: {
  options: (Option & { description?: string })[];
  value: string;
  onSelect: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const fallbackDescription = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('used')) return 'Pre-owned, checked and in excellent working condition';
    if (normalized.includes('sealed')) return 'Brand new in its original sealed packaging';
    if (normalized.includes('opened')) return 'A new phone that’s been unboxed but never used';
    return 'Choose the option that works best for you';
  };

  const getCategoryIcon = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('sealed')) return <PackageCheck className="h-4 w-4" />;
    if (normalized.includes('opened')) return <Smartphone className="h-4 w-4" />;
    return <ShieldCheck className="h-4 w-4" />;
  };

  return (
    <StepCard
      title="What condition would you like your next iPhone in?"
      description="Choose from our available device categories."
      showBackButton
      onBack={onBack}
      onContinue={onContinue}
      continueDisabled={!value}
    >
      <OptionCardList
        options={options.map((option) => ({
          ...option,
          description: option.description || fallbackDescription(option.label),
          image: getCategoryIcon(option.label),
        }))}
        value={value}
        onChange={onSelect}
      />
    </StepCard>
  );
}

export function UpgradePhoneStep({
  availablePrices,
  value,
  onSelect,
  onContinue,
  onBack,
}: {
  availablePrices: PhoneSellingPrice[];
  value: { model: string; storage: string };
  onSelect: (selection: { model: string; storage: string }) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const groups = useMemo(
    () =>
      [...new Set(availablePrices.map((item) => modelGroup(item.model)).filter(Boolean))].sort(
        (first, second) => modelNumber(`iPhone ${second}`) - modelNumber(`iPhone ${first}`)
      ),
    [availablePrices]
  );

  const [selectedGroup, setSelectedGroup] = useState(
    value.model ? modelGroup(value.model) : ''
  );
  const [selectedModel, setSelectedModel] = useState(value.model || '');
  const [selectedStorage, setSelectedStorage] = useState(value.storage || '');

  const versions = useMemo(
    () => [
      ...new Set(
        availablePrices
          .filter((item) => modelGroup(item.model) === selectedGroup)
          .map((item) => item.model)
      ),
    ],
    [availablePrices, selectedGroup]
  );

  const storageOptions = useMemo(
    () =>
      availablePrices
        .filter((item) => item.model === selectedModel)
        .map((item) => ({ value: item.storage, label: item.storage })),
    [availablePrices, selectedModel]
  );

  const canContinue = !!selectedModel && !!selectedStorage;

  function chooseGroup(group: string) {
    setSelectedGroup(group);
    setSelectedModel('');
    setSelectedStorage('');
    onSelect({ model: '', storage: '' });
  }

  function handleContinue() {
    if (canContinue) {
      onSelect({ model: selectedModel, storage: selectedStorage });
      onContinue();
    }
  }

  return (
    <StepCard
      title="Which iPhone would you like next?"
      description="Only compatible upgrades are shown."
      showBackButton
      onBack={onBack}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <section>
        <PillSelector
          options={groups.map((group) => ({
            value: group,
            label: `iPhone ${group}`,
          }))}
          value={selectedGroup}
          onChange={chooseGroup}
        />
      </section>

      {selectedGroup && (
        <section className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold text-zinc-500">
            Which model exactly?
          </h2>
          <OptionCardList
            options={versions.map((model) => ({ value: model, label: model }))}
            value={selectedModel}
            onChange={(model) => {
              setSelectedModel(model);
              setSelectedStorage('');
              onSelect({ model, storage: '' });
            }}
          />
        </section>
      )}

      {selectedModel && (
        <section className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold text-zinc-500">
            Storage Capacity
          </h2>
          <PillSelector
            options={storageOptions}
            value={selectedStorage}
            onChange={(storage) => {
              setSelectedStorage(storage);
              onSelect({ model: selectedModel, storage });
            }}
          />
        </section>
      )}
    </StepCard>
  );
}
