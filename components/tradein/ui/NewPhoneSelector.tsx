"use client";

import { useState } from 'react';
import Select from 'react-select';

const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.35rem',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: '#3b82f6',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      padding: '8px 12px',
    }),
    singleValue: (provided: any) => ({
        ...provided,
        color: '#1f2937',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
    }),
    input: (provided: any) => ({
        ...provided,
        color: '#1f2937',
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
};export interface NewPhoneFormData {
    category: string;
    model: string;
    storage: string;
}

export function NewPhoneSelector({ 
    formData,
    setFormData,
    finalPrice,
    categoryOptions,
    modelsForCategory,
    storageForModel,
}: { 
    formData: NewPhoneFormData;
    setFormData: (data: NewPhoneFormData) => void;
    finalPrice: number;
    categoryOptions: { value: string; label: string; }[];
    modelsForCategory: { value: string; label: string; }[];
    storageForModel: { value: string; label: string; }[];
}) {
    const [showCategoryTooltip, setShowCategoryTooltip] = useState(false);
    const { category: selectedCategory, model: selectedModel } = formData;

    const handleCategoryChange = (option: any) => {
        const newCategory = option ? option.value : '';
        setFormData({ ...formData, category: newCategory, model: '', storage: '' });
    };

    const handleModelChange = (option: any) => {
        const newModel = option ? option.value : '';
        setFormData({ ...formData, model: newModel, storage: '' });
    };

    const handleStorageChange = (option: any) => {
        const newStorage = option ? option.value : '';
        setFormData({ ...formData, storage: newStorage });
    };

    return (
        <div className="apple-card">
            <div className="text-center mb-8">
                <h1 className="apple-title mb-2">Select New Phone</h1>
                <p className="apple-body text-gray-600">Choose the phone you want to upgrade to</p>
            </div>

            <div className="space-y-6">
                <div className="relative">
                    <div className="flex items-center mb-3">
                        <label className="apple-subheadline font-medium text-gray-900">Category</label>
                        <div className="relative ml-2">
                            <button
                                type="button"
                                onClick={() => setShowCategoryTooltip(!showCategoryTooltip)}
                                className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center hover:bg-gray-500 transition-colors"
                                aria-label="Category info"
                            >
                                i
                            </button>
                            {showCategoryTooltip && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                                    <div className="mb-2 font-semibold">Category Definitions:</div>
                                    <div className="space-y-2">
                                        <div><strong>Used Premium Grade A:</strong> Pre-owned phones in excellent condition with minimal wear</div>
                                        <div><strong>New (sealed never opened):</strong> Brand new phones in original sealed packaging</div>
                                        <div><strong>New (opened but never used):</strong> New phones that have been unboxed, activated but never been used</div>
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Select
                        instanceId="category-select"
                        options={categoryOptions}
                        value={categoryOptions.find(option => option.value === selectedCategory)}
                        onChange={handleCategoryChange}
                        styles={customStyles}
                        placeholder="Select phone category"
                    />
                </div>

                <div>
                    <label className="apple-subheadline font-medium text-gray-900 mb-3 block">Model</label>
                    <Select
                        instanceId="model-select"
                        options={modelsForCategory}
                        value={modelsForCategory.find(option => option.value === selectedModel)}
                        onChange={handleModelChange}
                        styles={customStyles}
                        placeholder="Select iPhone model"
                        isDisabled={!selectedCategory}
                    />
                </div>

                <div>
                    <label className="apple-subheadline font-medium text-gray-900 mb-3 block">Storage</label>
                    <Select
                        instanceId="storage-select"
                        options={storageForModel}
                        value={storageForModel.find(option => option.value === formData.storage)}
                        onChange={handleStorageChange}
                        styles={customStyles}
                        placeholder="Select storage capacity"
                        isDisabled={!selectedModel}
                    />
                </div>
            </div>
        </div>
    );
}
