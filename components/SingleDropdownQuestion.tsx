'use client';

import { OptionCardList } from './tradein/OptionCardList';
import { StepCard } from './tradein/StepCard';

interface Props {
  question: string; description?: string; options: { value: string; label: string }[]; value: string;
  onSelect: (value: string) => void; onContinue?: () => void; onBack?: () => void;
}

export default function SingleDropdownQuestion({ question, description, options, value, onSelect, onContinue, onBack }: Props) {
  return <StepCard title={question} description={description} showBackButton={Boolean(onBack)} onBack={onBack} onContinue={onContinue} continueDisabled={!value}>
    <OptionCardList options={options} value={value} onChange={onSelect} />
  </StepCard>;
}
