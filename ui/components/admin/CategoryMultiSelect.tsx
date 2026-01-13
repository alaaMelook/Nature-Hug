'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Category } from '@/domain/entities/database/category';
import { X, ChevronDown, Check } from 'lucide-react';

interface CategoryMultiSelectProps {
    categories: Category[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    language: string;
    error?: boolean;
}

export function CategoryMultiSelect({
    categories,
    selectedIds,
    onChange,
    language,
    error = false
}: CategoryMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCategory = (categoryId: number) => {
        if (selectedIds.includes(categoryId)) {
            onChange(selectedIds.filter(id => id !== categoryId));
        } else {
            onChange([...selectedIds, categoryId]);
        }
    };

    const removeCategory = (categoryId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedIds.filter(id => id !== categoryId));
    };

    const getCategoryName = (category: Category) => {
        if (language === 'ar') {
            return category.name_ar || category.name_en;
        }
        return category.name_en || category.name_ar;
    };

    const selectedCategories = categories.filter(c => selectedIds.includes(c.id));

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Tags + Dropdown Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`min-h-[42px] w-full border rounded-lg shadow-sm p-2 cursor-pointer flex flex-wrap gap-1 items-center ${error ? 'border-red-500' : 'border-gray-300'
                    } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}`}
            >
                {selectedCategories.length > 0 ? (
                    selectedCategories.map(category => (
                        <span
                            key={category.id}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded-full"
                        >
                            {getCategoryName(category)}
                            <button
                                type="button"
                                onClick={(e) => removeCategory(category.id, e)}
                                className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))
                ) : (
                    <span className="text-gray-400 text-sm">اختر categories...</span>
                )}
                <ChevronDown
                    size={16}
                    className={`ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {categories.map(category => {
                        const isSelected = selectedIds.includes(category.id);
                        return (
                            <div
                                key={category.id}
                                onClick={() => toggleCategory(category.id)}
                                className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                                    {getCategoryName(category)}
                                </span>
                                {isSelected && <Check size={16} className="text-blue-600" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
