"use client";

import { useState, useEffect } from 'react';

export interface TradeInFormData {
    model: string;
    battery: string;
    faceid: string;
    backglass: string;
    screen: string;
    body: string;
    sim: string;
}

interface PhoneConditionSelectorProps {
    formData: TradeInFormData;
    setFormData: (data: TradeInFormData) => void;
    onFieldSelect?: () => void;
}

interface ConditionAttributeGroup {
    key: string;
    label: string;
    description?: string;
    options: { value: string; label: string; priceModifier: number }[];
}

export default function PhoneConditionSelector({ formData, setFormData, onFieldSelect }: PhoneConditionSelectorProps) {
    const [showBatteryTooltip, setShowBatteryTooltip] = useState(false);
    const [groups, setGroups] = useState<ConditionAttributeGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch('/api/admin/condition-attributes/groups');
                const data = await res.json();
                setGroups(data);
            } catch (error) {
                console.error('Failed to fetch condition attribute groups:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleSelectChange = (field: string, option: any) => {
        setFormData({ ...formData, [field]: option ? option.value : '' });
    };

    const getFieldValue = (key: string) => {
        return (formData as any)[key] as string;
    };

    const handleRadioChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (onFieldSelect) {
            onFieldSelect();
        }
    };

    return (
        <div className="apple-card">
            <div className="text-center mb-8">
                <h1 className="apple-title mb-2">Phone Condition</h1>
                <p className="apple-body text-gray-600">Tell us about your phone's current condition</p>
            </div>

            <div className="space-y-12">
                {loading && (
                    <div className="text-center text-gray-500">Loading condition fields...</div>
                )}

                {!loading && groups.map((group) => (
                    <fieldset key={group.key}>
                        <legend>
                            <div className="flex items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">{group.label}</h2>
                                {group.key === 'battery' && (
                                    <div className="relative ml-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowBatteryTooltip(!showBatteryTooltip)}
                                            className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center hover:bg-gray-500 transition-colors"
                                            aria-label="Battery info"
                                        >
                                            i
                                        </button>
                                        {showBatteryTooltip && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                                                <div className="mb-2 font-semibold">How to check battery health:</div>
                                                <div>Go to Settings → Battery → Battery Health & Charging</div>
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </legend>
                        <div className="space-y-3">
                            {group.options.map((option) => (
                                <div key={option.value} className="relative">
                                    <input
                                        type="radio"
                                        id={`${group.key}-${option.value}`}
                                        name={group.key}
                                        value={option.value}
                                        checked={getFieldValue(group.key) === option.value}
                                        onChange={(e) => handleRadioChange(group.key, e.target.value)}
                                        className="sr-only peer"
                                    />
                                    <label
                                        htmlFor={`${group.key}-${option.value}`}
                                        className="flex flex-col w-full p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 peer-checked:border-black peer-checked:bg-gray-100 peer-checked:ring-2 peer-checked:ring-gray-300 transition-all"
                                    >
                                        <span className="font-medium text-gray-900">{option.label}</span>
                                        {group.key !== 'sim' && (
                                            <span className="text-sm text-gray-500">{group.description ?? ''}</span>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                ))}
            </div>
        </div>
    );
}