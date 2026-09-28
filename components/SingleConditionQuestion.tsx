'use client';

import { useMemo, useState } from 'react';
import type { ConditionOption } from '@/types/tradein';
import { OptionCardList } from './tradein/OptionCardList';
import { StepCard } from './tradein/StepCard';
import { Smartphone, Battery, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  question: string;
  description?: string;
  fieldKey: string;
  options: ConditionOption[];
  value: string;
  onSelect: (value: string) => void;
  showBatteryInfo?: boolean;
  onContinue?: () => void;
  onScreenOriginChange?: (origin: 'original' | 'replaced') => void;
  onBatteryOriginChange?: (origin: 'original' | 'replaced') => void;
  onBack?: () => void;
}

const screenCopy = (option: ConditionOption) => {
  const label = option.label.toLowerCase();
  if (label.includes('mint')) return ['Flawless', 'No marks when the screen is on'];
  if (label.includes('light')) return ['Light scratches', 'Only visible at an angle'];
  if (label.includes('deep')) return ['Deep scratches', 'You can feel them with a fingernail'];
  if (label.includes('crack')) return ['Cracked', 'Any crack or chip in the glass'];
  return [option.label, option.description];
};

const backCopy = (option: ConditionOption) => {
  if (option.value === 'mint') return ['Flawless', 'No marks, scuffs or dents'];
  if (option.value === 'minor') return ['Light scratches', 'Small scuffs, no dents'];
  if (option.value === 'dents') return ['Dents or chips', 'Visible dents or chipped edges'];
  if (option.value === 'broken') return ['Cracked or broken', 'Any crack in the back panel'];
  return [option.label, option.description];
};

export default function SingleConditionQuestion({
  question,
  description,
  fieldKey,
  options,
  value,
  onSelect,
  showBatteryInfo = false,
  onContinue,
  onScreenOriginChange,
  onBatteryOriginChange,
  onBack,
}: Props) {
  const [screenStage, setScreenStage] = useState<'origin' | 'condition'>(value ? 'condition' : 'origin');
  const [screenOrigin, setScreenOrigin] = useState('');
  const [batteryStage, setBatteryStage] = useState<'origin' | 'condition'>(value ? 'condition' : 'origin');
  const [batteryOrigin, setBatteryOrigin] = useState('');

  const isScreen = fieldKey === 'screen';
  const isBattery = fieldKey === 'battery' || showBatteryInfo;
  const isFaceId = fieldKey === 'faceid';
  const isBackGlass = fieldKey === 'backglass';

  const title = showBatteryInfo
    ? 'What’s your battery health?'
    : isFaceId
      ? 'Does Face ID work?'
      : isScreen
        ? 'How does your screen look?'
        : isBackGlass
          ? 'How does the back of your phone look?'
          : question;

  const helper = showBatteryInfo
    ? "Choose the range that matches your phone's maximum capacity."
    : isFaceId
      ? 'Choose the option that matches your phone right now.'
      : isScreen || isBackGlass
        ? 'Pick the closest match. Your inspector will confirm it.'
        : description;

  const notice = showBatteryInfo ? (
    <>Open Settings → Battery → Battery Health &amp; Charging and look for “Maximum Capacity”.</>
  ) : isFaceId ? (
    <>Lock your phone and try unlocking it with your face. If it fails, choose “doesn’t work.”</>
  ) : undefined;

  const conditionOptions = useMemo(
    () =>
      ((isScreen || isBattery)
        ? options.filter((option) => !option.value.includes('changed') && !option.label.toLowerCase().includes('changed'))
        : options
      ).map((option) => {
        const [label, optionDescription] = isScreen
          ? screenCopy(option)
          : isBackGlass
            ? backCopy(option)
            : [option.label, option.description];
        
        let icon = undefined;
        if (showBatteryInfo) icon = <Battery className="h-4 w-4" />;
        else if (isFaceId) icon = <ShieldCheck className="h-4 w-4" />;
        else if (isScreen || isBackGlass) icon = <Smartphone className="h-4 w-4" />;

        return {
          value: option.value,
          label: label || option.label,
          description: optionDescription,
          image: icon,
        };
      }),
    [options, isScreen, isBackGlass, showBatteryInfo, isFaceId, isBattery]
  );

  if (isScreen && screenStage === 'origin') {
    return (
      <StepCard
        title="Has your screen ever been replaced?"
        description="Choose the option that matches your phone."
        noticeTitle="Check first"
        notice={
          <>On many newer iPhones, Settings → General → About → Parts and Service History lists any replaced parts.</>
        }
        showBackButton
        onBack={onBack}
        onContinue={() => setScreenStage('condition')}
        continueDisabled={!screenOrigin}
      >
        <OptionCardList
          value={screenOrigin}
          onChange={(origin) => {
            setScreenOrigin(origin);
            onScreenOriginChange?.(origin as 'original' | 'replaced');
          }}
          options={[
            {
              value: 'original',
              label: 'Original screen',
              description: 'Factory installed screen that has never been replaced.',
              image: <Sparkles className="h-4 w-4" />,
            },
            {
              value: 'replaced',
              label: 'Replaced screen',
              description: 'Choose this if it was ever changed by Apple or any repair shop.',
              image: <Smartphone className="h-4 w-4" />,
            },
          ]}
        />
      </StepCard>
    );
  }

  if (isBattery && batteryStage === 'origin') {
    return (
      <StepCard
        title="Has your battery ever been replaced?"
        description="Choose the option that matches your phone."
        noticeTitle="Check first"
        notice={
          <>On many newer iPhones, Settings → General → About → Parts and Service History lists if the battery was replaced.</>
        }
        showBackButton
        onBack={onBack}
        onContinue={() => setBatteryStage('condition')}
        continueDisabled={!batteryOrigin}
      >
        <OptionCardList
          value={batteryOrigin}
          onChange={(origin) => {
            setBatteryOrigin(origin);
            onBatteryOriginChange?.(origin as 'original' | 'replaced');
          }}
          options={[
            {
              value: 'original',
              label: 'Original battery',
              description: 'Factory installed battery that has never been replaced.',
              image: <Sparkles className="h-4 w-4" />,
            },
            {
              value: 'replaced',
              label: 'Replaced battery',
              description: 'Choose this if your battery was changed by Apple or any repair shop.',
              image: <Battery className="h-4 w-4" />,
            },
          ]}
        />
      </StepCard>
    );
  }

  return (
    <StepCard
      title={title}
      description={helper}
      notice={notice}
      noticeTitle={notice ? 'Check first' : undefined}
      showBackButton
      onBack={isScreen ? () => setScreenStage('origin') : isBattery ? () => setBatteryStage('origin') : onBack}
      onContinue={onContinue}
      continueDisabled={!value}
    >
      <OptionCardList options={conditionOptions} value={value} onChange={onSelect} />
    </StepCard>
  );
}
