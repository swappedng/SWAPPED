'use client';

import { useMemo, useState } from 'react';
import { StepCard } from './StepCard';
import { OptionCardList } from './OptionCardList';
import { PillSelector } from './PillSelector';

export interface PhoneOption {
  value: string;
  label: string;
  model: string;
  storage: string;
}

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

export function PhoneQuestionStep({
  options,
  value,
  onSelect,
}: {
  options: PhoneOption[];
  value: string;
  onSelect: (option: PhoneOption) => void;
}) {
  const selectedOption = options.find((option) => option.value === value);
  const groups = useMemo(
    () =>
      [...new Set(options.map((option) => modelGroup(option.model)).filter(Boolean))].sort(
        (first, second) => modelNumber(`iPhone ${second}`) - modelNumber(`iPhone ${first}`)
      ),
    [options]
  );
  const [selectedGroup, setSelectedGroup] = useState(
    selectedOption ? modelGroup(selectedOption.model) : ''
  );
  const [selectedModel, setSelectedModel] = useState(selectedOption?.model || '');
  const [selectedStorage, setSelectedStorage] = useState(selectedOption?.storage || '');

  const versions = useMemo(
    () => [
      ...new Set(
        options
          .filter((option) => modelGroup(option.model) === selectedGroup)
          .map((option) => option.model)
      ),
    ],
    [options, selectedGroup]
  );
  const storageOptions = useMemo(
    () => options.filter((option) => option.model === selectedModel),
    [options, selectedModel]
  );
  const canContinue = !!selectedModel && !!selectedStorage;

  function chooseGroup(group: string) {
    setSelectedGroup(group);
    setSelectedModel('');
    setSelectedStorage('');
  }

  function continueToNextStep() {
    const option = storageOptions.find((item) => item.storage === selectedStorage);
    if (option) onSelect(option);
  }

  return (
    <StepCard
      title="Which iPhone do you have?"
      noticeTitle="Not sure?"
      notice={
        <>
          Open Settings → General → About. Model Name shows the full name, and Capacity shows the storage.
        </>
      }
      onContinue={continueToNextStep}
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
            options={storageOptions.map((option) => ({
              value: option.storage,
              label: option.storage,
            }))}
            value={selectedStorage}
            onChange={setSelectedStorage}
          />
        </section>
      )}
    </StepCard>
  );
}
