"use client";

import { useEffect, useMemo, useState } from "react";
import { StepCard } from "../ui/StepCard";
import { ExpandingSection } from "../ui/ExpandingSection";
import { OptionCardList } from "../ui/OptionCardList";
import { PillSelector } from "../ui/PillSelector";
import { modelNumber, modelGroup } from "@/lib/phone-models";

export interface PhoneOption {
  id: string;
  label: string;
  model: string;
  storage: string;
}

export function PhoneQuestionStep({
  options,
  value,
  initialModel,
  onSelect,
}: {
  options: PhoneOption[];
  value: string;
  initialModel?: string;
  onSelect: (option: PhoneOption) => void;
}) {
  const selectedOption = options.find((option) => option.id === value);
  const groups = useMemo(
    () =>
      [
        ...new Set(
          options.map((option) => modelGroup(option.model)).filter(Boolean),
        ),
      ].sort(
        (first, second) =>
          modelNumber(`iPhone ${second}`) - modelNumber(`iPhone ${first}`),
      ),
    [options],
  );
  const [selectedGroup, setSelectedGroup] = useState(
    selectedOption ? modelGroup(selectedOption.model) : "",
  );
  const [selectedModel, setSelectedModel] = useState(
    selectedOption?.model || "",
  );
  const [selectedStorage, setSelectedStorage] = useState(
    selectedOption?.storage || "",
  );

  useEffect(() => {
    if (!initialModel || selectedOption) return;

    const option = options.find((item) => item.model === initialModel);
    if (!option) return;

    setSelectedGroup(modelGroup(option.model));
    setSelectedModel(option.model);
  }, [initialModel, options, selectedOption]);

  const versions = useMemo(
    () => [
      ...new Set(
        options
          .filter((option) => modelGroup(option.model) === selectedGroup)
          .map((option) => option.model),
      ),
    ],
    [options, selectedGroup],
  );
  const storageOptions = useMemo(
    () => options.filter((option) => option.model === selectedModel),
    [options, selectedModel],
  );
  const canContinue = !!selectedModel && !!selectedStorage;

  function chooseGroup(group: string) {
    setSelectedGroup(group);
    setSelectedModel("");
    setSelectedStorage("");
  }

  function continueToNextStep() {
    const option = storageOptions.find(
      (item) => item.storage === selectedStorage,
    );
    if (option) onSelect(option);
  }

  return (
    <StepCard
      title="Which iPhone do you have?"
      noticeTitle="Not sure?"
      notice={
        <>
          Open Settings → General → About. Model Name shows the full name, and
          Capacity shows the storage.
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

      <ExpandingSection isOpen={Boolean(selectedGroup)}>
        <div className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold text-[#69717d]">
            Which model exactly?
          </h2>
          <OptionCardList
            options={versions.map((model) => ({ value: model, label: model }))}
            value={selectedModel}
            onChange={(model) => {
              setSelectedModel(model);
              setSelectedStorage("");
            }}
          />
        </div>
      </ExpandingSection>

      <ExpandingSection isOpen={Boolean(selectedModel)}>
        <div className="mt-6">
          <h2 className="mb-2.5 text-sm font-semibold text-[#69717d]">
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
        </div>
      </ExpandingSection>
    </StepCard>
  );
}
