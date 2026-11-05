'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { StepCard } from '../ui/StepCard';
import { PillSelector } from "../ui/PillSelector";
import { OptionCardList } from "../ui/OptionCardList";
import type { PhoneSellingPrice } from '@/types/tradein';
import { modelNumber, modelGroup } from '@/lib/phone-models';

type Option = { value: string; label: string; description?: string; imagePath?: string };

export function UpgradeCategoryStep({
  options,
  value,
  onSelect,
  onContinue,
  onBack,
}: {
  options: (Option & { description?: string; imagePath?: string })[];
  value: string;
  onSelect: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {

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
          description: option.description,
          image: option.imagePath ? (
            <Image
              src={option.imagePath}
              alt=""
              width={48}
              height={64}
              className="h-16 w-10 object-contain"
            />
          ) : undefined,
          imageSize: option.imagePath ? ('preview' as const) : undefined,
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
      description="Only higher and available upgrades are shown."
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
          <h2 className="mb-2.5 text-sm font-semibold text-[#69717d]">
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
          <h2 className="mb-2.5 text-sm font-semibold text-[#69717d]">
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
