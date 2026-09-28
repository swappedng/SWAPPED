'use client';

import { OptionCardList } from './OptionCardList';
import { StepCard } from './StepCard';
import { Truck, Store } from 'lucide-react';

export function SwapMethodStep({
  value,
  onSelect,
  onComplete,
  isSaving,
  onBack,
}: {
  value: string;
  onSelect: (value: string) => void;
  onComplete: () => void;
  isSaving: boolean;
  onBack?: () => void;
}) {
  return (
    <StepCard
      title="How should we complete your swap?"
      description="Choose the option that works best for you."
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      onContinue={onComplete}
      continueDisabled={!value || isSaving}
      continueLabel={isSaving ? 'Saving…' : 'Complete request'}
    >
      <OptionCardList
        value={value}
        onChange={onSelect}
        options={[
          {
            value: 'online',
            label: 'Dispatch pickup',
            description: 'We arrange a device inspection and pickup at your location.',
            image: <Truck className="h-4 w-4" />,
          },
          {
            value: 'in-person',
            label: 'Walk in',
            description: 'Complete your inspection and exchange in person at our store.',
            image: <Store className="h-4 w-4" />,
          },
        ]}
      />
    </StepCard>
  );
}
