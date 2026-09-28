"use client";

import Select from 'react-select';
import { useState, useEffect } from 'react';
import { loadPhoneModels, type PhoneModelOption } from '../lib/phone-models';

const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'white !important',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.35rem',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 1px #000000' : 'none',
      '&:hover': {
        borderColor: '#000000',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#000000' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      padding: '8px 12px',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: '#1f2937 !important',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
    }),
    input: (provided: any) => ({
        ...provided,
        color: '#1f2937 !important',
        fontSize: '16px',
    }),
    valueContainer: (provided: any) => ({
        ...provided,
        padding: '8px',
    }),
    placeholder: (provided: any) => ({
        ...provided,
        color: '#9ca3af',
        fontSize: '16px',
    }),
    menu: (provided: any) => ({
        ...provided,
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }),
    menuList: (provided: any) => ({
        ...provided,
        backgroundColor: 'white',
        borderRadius: '0.5rem',
    }),
};

export interface TradeInFormData {
    model: string;
    storage: string;
    battery: string;
    faceid: string;
    backglass: string;
    screen: string;
    body: string;
    sim: string;
}

interface PhoneModelSelectorProps {
    formData: TradeInFormData;
    setFormData: (data: TradeInFormData) => void;
    onSelect?: () => void;
}

export default function PhoneModelSelector({ formData, setFormData, onSelect }: PhoneModelSelectorProps) {
    const [modelOptions, setModelOptions] = useState<PhoneModelOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const models = await loadPhoneModels();
                setModelOptions(models);
            } catch (error) {
                console.error('Failed to fetch phone models:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchModels();
    }, []);

    const handleSelectChange = (field: string, option: any) => {
        if (field === 'model' && option) {
            // Extract storage from model value (e.g., "15pro-256" -> "256")
            const modelValue = option.value;
            const parts = modelValue.split('-');
            const storage = option.storage || (parts.length > 1 ? parts[parts.length - 1] : '');
            
            setFormData({ 
                ...formData, 
                model: modelValue,
                storage: storage
            });
        } else {
            setFormData({ ...formData, [field]: option ? option.value : '' });
        }
        
        if (option && onSelect) {
            onSelect();
        }
    };

    return (
        <div className="apple-card">
            <div className="text-center mb-8">
                <h1 className="apple-title mb-2">Select Your iPhone</h1>
                <p className="apple-body text-gray-600">Choose your current iPhone model and storage</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="apple-subheadline font-medium text-gray-900 mb-3 block">iPhone Model & Storage</label>
                    {loading ? (
                        <div className="text-gray-500">Loading models...</div>
                    ) : (
                        <Select
                            instanceId="model-select"
                            options={modelOptions}
                            value={modelOptions.find(option => option.value === formData.model)}
                            onChange={(option) => handleSelectChange('model', option)}
                            styles={customStyles}
                            placeholder="Select your iPhone model"
                            isSearchable
                            className="w-full"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
