'use client';

import { OptionCardList } from '../ui/OptionCardList';
import { StepCard } from '../ui/StepCard';
import { Truck, Store } from 'lucide-react';
import { SwapMethod } from '@/lib/api/types/enums';

export function SwapMethodStep({
  value,
  onSelect,
  onComplete,
  isSaving,
  onBack,
}: {
  value: SwapMethod | '';
  onSelect: (value: SwapMethod) => void;
  onComplete: () => void;
  isSaving: boolean;
  onBack?: () => void;
}) {
  const canContinue = value && !isSaving;

  return (
    <StepCard
      title="How should we complete your swap?"
      description="Choose the option that works best for you."
      showBackButton={Boolean(onBack)}
      onBack={onBack}
      onContinue={onComplete}
      continueDisabled={!canContinue}
      continueLabel={isSaving ? 'Saving…' : 'Complete request'}
    >
      <OptionCardList
        value={value as SwapMethod}
        onChange={onSelect}
        options={[
          {
            value: SwapMethod.HOME_PICKUP,
            label: 'Home Pickup',
            description: 'We arrange a device inspection and pickup at your location.',
            image: <Truck className="h-4 w-4" />,
          },
          {
            value: SwapMethod.WALK_IN,
            label: 'Store Visit',
            description: 'Complete your inspection and exchange in person at our store.',
            image: <Store className="h-4 w-4" />,
          },
        ]}
      />
    </StepCard>
  );
}
