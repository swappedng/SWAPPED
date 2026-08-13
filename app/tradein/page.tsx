"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PhoneModelSelector from '../../components/PhoneModelSelector';
import SingleConditionQuestion from '../../components/SingleConditionQuestion';
import SingleDropdownQuestion from '../../components/SingleDropdownQuestion';
import { NewPhoneFormData } from '../../components/NewPhoneSelector';
import CalendlyWidget from '../../components/CalendlyWidget';

const pricingData: any = {
    'x-64': { base: 150000, series: 'x' },
    'x-256': { base: 170000, series: 'x' },
    'xs-64': { base: 180000, series: 'x' },
    'xs-256': { base: 200000, series: 'x' },
    'xr-64': { base: 170000, series: 'x' },
    'xr-128': { base: 200000, series: 'x' },
    'xsmax-64': { base: 220000, series: 'xsmax' },
    'xsmax-256': { base: 250000, series: 'xsmax' },
    '11-64': { base: 240000, series: '11' },
    '11-128': { base: 270000, series: '11' },
    '11pro-64': { base: 300000, series: '11' },
    '11pro-256': { base: 330000, series: '11' },
    '11promax-64': { base: 340000, series: '11promax' },
    '11promax-256': { base: 370000, series: '11promax' },
    '12-64': { base: 270000, series: '12' },
    '12-128': { base: 310000, series: '12' },
    '12pro-128': { base: 370000, series: '12' },
    '12pro-256': { base: 400000, series: '12' },
    '12promax-128': { base: 470000, series: '12promax' },
    '12promax-256': { base: 500000, series: '12promax' },
    '13-128': { base: 400000, series: '13' },
    '13-256': { base: 440000, series: '13' },
    '13mini-128': { base: 350000, series: '13' },
    '13mini-256': { base: 380000, series: '13' },
    '13pro-128': { base: 500000, series: '13pro' },
    '13pro-256': { base: 560000, series: '13pro' },
    '13promax-128': { base: 600000, series: '13pro' },
    '13promax-256': { base: 650000, series: '13pro' },
    '14-128': { base: 500000, series: '14' },
    '14-256': { base: 550000, series: '14' },
    '14pro-128': { base: 700000, series: '14' },
    '14pro-256': { base: 750000, series: '14' },
    '14promax-128': { base: 780000, series: '14promax' },
    '14promax-256': { base: 820000, series: '14promax' },
    '14promax-512': { base: 850000, series: '14promax' },
    '15-128': { base: 750000, series: '14promax' },
    '15-256': { base: 790000, series: '14promax' },
    '15pro-128': { base: 900000, series: '15pro' },
    '15pro-256': { base: 930000, series: '15pro' },
    '15pro-512': { base: 980000, series: '15pro' },
    '15promax-256': { base: 1000000, series: '15pro' },
    '15promax-512': { base: 1050000, series: '15pro' },
    '16-128': { base: 950000, series: '16' },
    '16-256': { base: 1000000, series: '16' },
    '16-512': { base: 1050000, series: '16' }
  };

const newPhoneDatabase: any = {
    "Used Premium Grade A": {
        "iPhone X": { "64GB": 135000, "256GB": 155000 },
        "iPhone XS": { "64GB": 160000, "256GB": 180000 },
        "iPhone XR": { "64GB": 155000, "128GB": 180000 },
        "iPhone XS Max": { "64GB": 200000, "256GB": 225000 },
        "iPhone 11": { "64GB": 210000, "128GB": 240000 },
        "iPhone 11 Pro": { "64GB": 270000, "256GB": 300000 },
        "iPhone 11 Pro Max": { "64GB": 310000, "256GB": 340000 },
        "iPhone 12": { "64GB": 280000, "128GB": 320000 },
        "iPhone 12 Pro": { "128GB": 380000, "256GB": 410000 },
        "iPhone 12 Pro Max": { "128GB": 450000, "256GB": 480000 },
        "iPhone 13": { "128GB": 400000, "256GB": 440000 },
        "iPhone 13 Pro": { "128GB": 520000, "256GB": 560000 },
        "iPhone 13 Pro Max": { "128GB": 600000, "256GB": 640000 },
        "iPhone 14": { "128GB": 500000, "256GB": 540000 },
        "iPhone 14 Pro": { "128GB": 680000, "256GB": 720000 },
        "iPhone 14 Pro Max": { "128GB": 780000, "256GB": 820000, "512GB": 850000 },
    },
    "New (sealed never opened)": {
        "iPhone 13": { "128GB": 520000 },
        "iPhone 15": { "128GB": 850000, "256GB": 950000 },
        "iPhone 15 Plus": { "128GB": 950000, "256GB": 1050000 },
        "iPhone 15 Pro": { "128GB": 1100000, "256GB": 1200000 },
        "iPhone 15 Pro Max": { "256GB": 1350000, "512GB": 1500000 },
    },
    "New (opened but never used)": {
        "iPhone 15 Pro Max": { "256GB": 1250000 },
    }
};

export default function TradeInPage() {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [conditionGroups, setConditionGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  interface TradeInFormData {
    model: string;
    storage: string;
    battery: string;
    faceid: string;
    backglass: string;
    screen: string;
    body: string;
    sim: string;
  }

  const [tradeInFormData, setTradeInFormData] = useState<TradeInFormData>({
    model: '',
    storage: '',
    battery: '',
    faceid: '',
    backglass: '',
    screen: '',
    body: '',
    sim: 'physical'
  });

  const [newPhoneFormData, setNewPhoneFormData] = useState<NewPhoneFormData>({
    category: 'Premium Used Grade A',
    model: '',
    storage: ''
  });

  const [email, setEmail] = useState('');
  const [swapMethod, setSwapMethod] = useState('');
  const [showCalendly, setShowCalendly] = useState(false);
  const [savedSwapId, setSavedSwapId] = useState<string>('');

  const router = useRouter();

  // Fetch condition attribute groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/admin/condition-attributes/groups');
        const data = await res.json();
        setConditionGroups(data);
      } catch (error) {
        console.error('Failed to fetch condition attribute groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // ===== CALCULATIONS =====
  const tradeInPrice = useMemo(() => {
    const { model } = tradeInFormData;
    
    if (!model || conditionGroups.length === 0) {
      return 0;
    }

    // Get base price from admin phone models (already converted from hardcoded pricing)
    const modelData:any = pricingData[model as keyof typeof pricingData];
    if (!modelData) return 0;
    
    let basePrice = modelData.base;
    let totalModifier = 1.0; // Start with 100%
    
    // Apply price modifiers from admin condition attributes
    conditionGroups.forEach(group => {
      const selectedValue = (tradeInFormData as any)[group.key];
      if (selectedValue) {
        const selectedOption = group.options.find((opt: any) => opt.value === selectedValue);
        if (selectedOption) {
          totalModifier *= selectedOption.priceModifier;
        }
      }
    });
    
    return Math.round(basePrice * totalModifier);
  }, [tradeInFormData, conditionGroups]);

  const newPhonePrice = useMemo(() => {
    const { category, model, storage } = newPhoneFormData;
    if (!category || !model || !storage || !newPhoneDatabase[category]?.[model]?.[storage]) {
        return 0;
    }
    return newPhoneDatabase[category][model][storage] || 0;
  }, [newPhoneFormData]);

  const amountToPay = newPhonePrice - tradeInPrice;

  // ===== DROPDOWN OPTIONS =====
  const categoryOptions = useMemo(() => {
    return Object.keys(newPhoneDatabase).map(cat => ({ value: cat, label: cat }));
  }, []);

  const modelsForCategory = useMemo(() => {
      if (!newPhoneFormData.category || !newPhoneDatabase[newPhoneFormData.category]) return [];
      return Object.keys(newPhoneDatabase[newPhoneFormData.category]).map(model => ({ value: model, label: model }));
  }, [newPhoneFormData.category]);

  const storageForModel = useMemo(() => {
      if (!newPhoneFormData.category || !newPhoneFormData.model || !newPhoneDatabase[newPhoneFormData.category]?.[newPhoneFormData.model]) return [];
      return Object.keys(newPhoneDatabase[newPhoneFormData.category][newPhoneFormData.model]).map(storage => ({ value: storage, label: storage }));
  }, [newPhoneFormData.category, newPhoneFormData.model]);

  // ===== VALIDATION =====
  const totalConditionSteps = conditionGroups.length; // Dynamic based on fetched groups
  const newPhoneCategoryStep = 2 + totalConditionSteps; // After model + all conditions
  const newPhoneModelStep = newPhoneCategoryStep + 1;
  const newPhoneStorageStep = newPhoneModelStep + 1;
  const summaryStep = newPhoneStorageStep + 1;
  const swapMethodStep = summaryStep + 1;

  const isStep1Valid = useMemo(() => {
    return !!tradeInFormData.model;
  }, [tradeInFormData.model]);

  const areAllConditionsValid = useMemo(() => {
    return conditionGroups.every(group => !!(tradeInFormData as any)[group.key]);
  }, [tradeInFormData, conditionGroups]);

  const isCategoryValid = useMemo(() => {
    return !!newPhoneFormData.category;
  }, [newPhoneFormData.category]);

  const isNewPhoneModelValid = useMemo(() => {
    return !!newPhoneFormData.model;
  }, [newPhoneFormData.model]);

  const isNewPhoneStorageValid = useMemo(() => {
    return !!newPhoneFormData.storage;
  }, [newPhoneFormData.storage]);

  const isEmailValid = useMemo(() => {
    return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isSwapMethodValid = useMemo(() => {
    return !!swapMethod;
  }, [swapMethod]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (containerRef.current) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [step]);

  useEffect(() => {
    if (step === newPhoneModelStep) {
        const firstModel = modelsForCategory.length > 0 ? modelsForCategory[0].value : '';
        if (newPhoneFormData.model !== firstModel) {
            setNewPhoneFormData(prev => ({ ...prev, model: firstModel, storage: '' }));
        }
    }
  }, [newPhoneFormData.category, modelsForCategory, step, newPhoneModelStep]);

  useEffect(() => {
    if (step === newPhoneStorageStep) {
        const firstStorage = storageForModel.length > 0 ? storageForModel[0].value : '';
        if (newPhoneFormData.storage !== firstStorage) {
            setNewPhoneFormData(prev => ({ ...prev, storage: firstStorage }));
        }
    }
  }, [newPhoneFormData.model, storageForModel, step, newPhoneStorageStep]);

  // ===== HANDLERS =====
  const handleNextStep = async () => {
    if (step === summaryStep && isEmailValid) {
      try {
        // Send email with breakdown details
        const response = await fetch('/api/estimates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            tradeInDevice: {
              model: tradeInFormData.model,
              storage: tradeInFormData.storage,
              condition: tradeInFormData
            },
            newDevice: {
              category: newPhoneFormData.category,
              model: newPhoneFormData.model,
              storage: newPhoneFormData.storage
            },
            tradeInPrice,
            newPhonePrice,
            amountToPay,
            sendEmail: true
          }),
        });

        if (response.ok) {
          // Navigate to appointment booking page
          window.location.href = '/tradein/schedule';
        } else {
          console.error('Failed to send email');
          // Still navigate to appointment booking
          window.location.href = '/tradein/schedule';
        }
      } catch (error) {
        console.error('Error sending email:', error);
        // Still navigate to appointment booking
        window.location.href = '/tradein/schedule';
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleModelSelected = () => {
    // This callback runs in the same event as setFormData, so checking
    // isStep1Valid here can read the previous (empty) model value.
    setTimeout(() => setStep(2), 300);
  };

  const handleConditionSelected = (field: string, value: string) => {
    setTradeInFormData(prev => ({ ...prev, [field]: value }));
    // Auto-advance after selection
    setTimeout(() => {
      setStep(prev => prev + 1);
    }, 300);
  };

  const handleSaveSwap = async () => {
    console.log('handleSaveSwap called');
    if (!isStep1Valid || !areAllConditionsValid || !isCategoryValid || !isNewPhoneModelValid || !isNewPhoneStorageValid || !isEmailValid || !isSwapMethodValid) {
      return;
    }
    setIsSaving(true);

    try {
      const response = await fetch('/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeInPhone: tradeInFormData,
          newPhone: newPhoneFormData,
          contactEmail: email,
          swapMethod: swapMethod,
          tradeInValue: tradeInPrice,
          newPhonePrice: newPhonePrice,
          amountToPay: amountToPay,
        }),
      });

      if (response.ok) {
        const swap = await response.json();
        setSavedSwapId(swap.id);
        setShowCalendly(true);
      } else {
        console.error('Failed to save swap');
      }
    } catch (error) {
      console.error('Error saving swap:', error);
    } finally {
        setIsSaving(false);
    }
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              step === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-black hover:bg-gray-100 active:scale-95'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Prev question</span>
          </button>
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/swapped-logo.png" width={24} height={24} alt="" />
            <span className="text-xl tracking-tight">Swapped</span>
          </div>
          
          {/* Progress or Step Indicator */}
          <div className="text-sm text-gray-500 font-medium">
           
          </div>
        </div>
      </header>

      <div ref={containerRef} className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ 
                  width: `${(step / swapMethodStep) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Step 1: Phone Model Selection */}
        {step === 1 && (
          <div>
            {/* Explanatory text */}
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h1 className="text-2xl lg:text-3xl font-semibold text-black mb-6 tracking-tight">
                Help us determine your iPhone's
                <span className="text-black font-light italic"> exact value</span>
              </h1>
              <p className="text-lg text-black/70 leading-relaxed font-medium">
                Answer a few quick questions to get an accurate quote for your trade-in.
              </p>
            </div>
            
            <PhoneModelSelector 
              formData={tradeInFormData}
              setFormData={setTradeInFormData}
              onSelect={handleModelSelected}
            />
          </div>
        )}

        {step >= 2 && step < newPhoneCategoryStep && loadingGroups && (
          <div className="apple-card max-w-2xl mx-auto text-center text-gray-500">
            Loading the next question...
          </div>
        )}

        {/* Steps 2 to N: Individual Condition Questions */}
        {step >= 2 && step < newPhoneCategoryStep && !loadingGroups && (
          (() => {
            const groupIndex = step - 2;
            const group = conditionGroups[groupIndex];
            
            if (!group) return null;

            return (
              <div>
                <SingleConditionQuestion
                  question={group.label}
                  description={group.description}
                  fieldKey={group.key}
                  options={group.options}
                  value={(tradeInFormData as any)[group.key] || ''}
                  onSelect={(value) => handleConditionSelected(group.key, value)}
                  showBatteryInfo={group.key === 'battery'}
                />
              </div>
            );
          })()
        )}

        {/* New Phone Category Selection */}
        {step === newPhoneCategoryStep && (
          <div>
            <SingleDropdownQuestion
              question="What category of phone do you want?"
              description="Choose the condition type for your new phone"
              options={categoryOptions}
              value={newPhoneFormData.category}
              onSelect={(value) => {
                setNewPhoneFormData(prev => ({ ...prev, category: value, model: '', storage: '' }));
                setTimeout(() => setStep(newPhoneModelStep), 300);
              }}
              showTooltip={true}
              tooltipContent={`
                <div class="mb-2 font-semibold">Category Definitions:</div>
                <div class="space-y-2">
                  <div><strong>Used Premium Grade A:</strong> Pre-owned phones in excellent condition with minimal wear</div>
                  <div><strong>New (sealed never opened):</strong> Brand new phones in original sealed packaging</div>
                  <div><strong>New (opened but never used):</strong> New phones that have been unboxed but never been used</div>
                </div>
              `}
            />
            <div className="flex gap-3 mt-6 max-w-2xl mx-auto">
              <button 
                onClick={handlePrevStep}
                className="
                  relative flex items-center justify-center px-10 py-3 w-full
                  bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                  rounded-full font-semibold text-white text-lg tracking-wide
                  hover:scale-105 transition-all duration-300
                  shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818,inset_0px_-3px_1px_rgba(0,0,0,0.5),inset_2.5px_-2px_3px_rgba(124,108,94,0.75),inset_0px_-3px_3px_1px_rgba(255,245,221,0.1)]
                "
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* New Phone Model Selection */}
        {step === newPhoneModelStep && (
          <div>
            <SingleDropdownQuestion
              question="Which iPhone model?"
              description="Select the specific model you want"
              options={modelsForCategory}
              value={newPhoneFormData.model}
              onSelect={(value) => {
                setNewPhoneFormData(prev => ({ ...prev, model: value, storage: '' }));
                setTimeout(() => setStep(newPhoneStorageStep), 300);
              }}
            />
          </div>
        )}

        {/* New Phone Storage Selection */}
        {step === newPhoneStorageStep && (
          <div>
            <SingleDropdownQuestion
              question="How much storage?"
              description="Choose your preferred storage capacity"
              options={storageForModel}
              value={newPhoneFormData.storage}
              onSelect={(value) => {
                setNewPhoneFormData(prev => ({ ...prev, storage: value }));
                setTimeout(() => setStep(summaryStep), 300);
              }}
            />
          </div>
        )}

        {/* Summary Step */}
        {step === summaryStep && (
          <div className="max-w-2xl mx-auto">
            {/* Single Unified Card */}
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg">
              {/* Header with Success Icon */}
              <div className="text-center mb-6">
               
                <h1 className="text-2xl font-black text-black mb-2 tracking-tight">
                  You're Almost Done!
                </h1>
                <p className="text-sm text-black/60 font-medium">
                  Complete your swap and get your new iPhone
                </p>
              </div>

              {/* Amount Section */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Amount to Pay
                </p>
                <div className="text-2xl font-semibold text-black mb-3">
                  ₦{(amountToPay - 20000).toLocaleString()} - ₦{(amountToPay + 20000).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {/* add an info icon here */}
                  Final amount determined after device inspection
                </p>
              </div>

              {/* Email Section */}
              <div className="mb-6">
                <div className="text-center mb-4">
              
                  <h3 className="text-base font-bold text-black mb-2">
                    Get Your Breakdown
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We'll email complete details & appointment booking
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative w-full max-w-md mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your Email"
                      className="
                        w-full h-[58px] pl-6 pr-32 
                        border-2 border-gray-300 rounded-full bg-white text-black placeholder-gray-500
                        focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none 
                        transition-all duration-200 text-base font-medium
                        shadow-sm
                      "
                    />
                    <button 
                      onClick={handleNextStep}
                      disabled={!isEmailValid}
                      className="
                        absolute right-1 top-1 bottom-1
                        px-6 py-2 h-[50px]
                        bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                        text-white font-bold rounded-full
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:scale-[1.02] active:scale-[0.98]
                        shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818,inset_0px_-3px_1px_rgba(0,0,0,0.5),inset_2.5px_-2px_3px_rgba(124,108,94,0.75),inset_0px_-3px_3px_1px_rgba(255,245,221,0.1)]
                        flex items-center justify-center
                      "
                    >
                      Send Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  You'll be redirected to booking after sending details
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Swap Method Step */}
        {step === swapMethodStep && (
          <div className="apple-card">
            <div className="text-center mb-6">
              <h2 className="apple-title mb-2">Choose Swap Method</h2>
              <p className="apple-body text-gray-600">How would you like to complete your trade-in?</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <button
                type="button"
                onClick={() => setSwapMethod('online')}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  swapMethod === 'online'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="apple-headline text-gray-900 mb-2">Online Swap</h3>
                    <p className="apple-body text-gray-600 mb-3">Expert check, dispatch pick up</p>
                    <ul className="apple-footnote text-gray-500 space-y-1">
                      <li>• Professional device inspection</li>
                      <li>• Free pickup from your location</li>
                      <li>• Secure packaging provided</li>
                      <li>• 24-48 hour processing</li>
                    </ul>
                  </div>
                  {swapMethod === 'online' && (
                    <div className="ml-4">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSwapMethod('in-person')}
                className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  swapMethod === 'in-person'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="apple-headline text-gray-900 mb-2">In Person Swap</h3>
                    <p className="apple-body text-gray-600 mb-3">Visit our store location</p>
                    <ul className="apple-footnote text-gray-500 space-y-1">
                      <li>• Immediate device inspection</li>
                      <li>• Face-to-face service</li>
                      <li>• Instant trade completion</li>
                      <li>• Same-day device exchange</li>
                    </ul>
                  </div>
                  {swapMethod === 'in-person' && (
                    <div className="ml-4">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handlePrevStep}
                className="
                  relative flex items-center justify-center px-10 py-3 flex-1
                  bg-gradient-to-b from-[#1D1B1C] via-[#191718] to-[#252120]
                  rounded-full font-semibold text-white text-lg tracking-wide
                  hover:scale-105 transition-all duration-300
                  shadow-[inset_0px_0px_0.25px_1.25px_#262524,inset_3px_5px_2px_-4.75px_#FFFFFF,inset_1.25px_1.5px_0px_rgba(0,0,0,0.75),inset_0px_4.75px_0.25px_-2.5px_#FBFBFB,inset_1px_1px_3px_3px_#1A1818,inset_0px_-3px_1px_rgba(0,0,0,0.5),inset_2.5px_-2px_3px_rgba(124,108,94,0.75),inset_0px_-3px_3px_1px_rgba(255,245,221,0.1)]
                "
              >
                Back
              </button>
              <button 
                onClick={handleSaveSwap}
                disabled={isSaving || !isStep1Valid || !areAllConditionsValid || !isCategoryValid || !isNewPhoneModelValid || !isNewPhoneStorageValid || !isEmailValid || !isSwapMethodValid}
                className="apple-button-primary flex-1 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? 'Processing...' : 'Complete Swap'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendly Widget Modal */}
      <CalendlyWidget
        isOpen={showCalendly}
        onClose={() => {
          setShowCalendly(false);
          // Redirect to confirmation page with swapId
          router.push(`/tradein/confirm?swapId=${savedSwapId}`);
        }}
        swapId={savedSwapId}
        swapMethod={swapMethod}
      />
    </div>
    </div>
  );
}
