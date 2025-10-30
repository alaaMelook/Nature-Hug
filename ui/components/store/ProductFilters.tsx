'use client';

import {Category} from "@/domain/entities/database/category";
import {langStore} from "@/lib/i18n/langStore";
import {useTranslation} from "@/ui/providers/TranslationProvider";
import React, {use} from "react";

export default function ProductFilters({onFilterChangeAction, initCategories}: {
    onFilterChangeAction: (filters: any) => void,
    initCategories: Promise<Category[]>
}) {
    const {t} = useTranslation();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        onFilterChangeAction({[name]: isCheckbox ? checked : value});
    };
    let categories: Category[] = use(initCategories);
    console.log('Categories:', categories);
    return (
        <div className="bg-primary-10 p-6 rounded-lg shadow-lg h-3/5  ">
            <h3 className="text-xl font-semibold mb-4">{t('filters')}</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">{t('search')}</label>
                    <input
                        type="text"
                        id="search"
                        name="search"
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="category"
                           className="block text-sm font-medium text-gray-700">{t('category')}</label>
                    <select
                        id="category"
                        name="category"
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                        <option value="">{t('all')}</option>
                        {categories?.map(category => (
                            <option key={category.id}
                                    value={langStore.get() === 'en' ? category.name_en : (category.name_ar ?? category.name_en)}> {langStore.get() === 'en' ? category.name_en : (category.name_ar ?? category.name_en)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">{t('sortBy')}</label>
                    <select
                        id="sortBy"
                        name="sortBy"
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                        <option value="name-asc">{t('nameAsc')}</option>
                        <option value="name-desc">{t('nameDesc')}</option>
                        <option value="price-asc">{t('priceAsc')}</option>
                        <option value="price-desc">{t('priceDesc')}</option>
                        <option value="rating-desc">{t('ratingDesc')}</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input
                        id="inStock"
                        name="inStock"
                        type="checkbox"
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">{t('inStockOnly')}</label>
                </div>
                <div className="flex items-center">
                    <input
                        id="onSale"
                        name="onSale"
                        type="checkbox"
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="onSale" className="ml-2 block text-sm text-gray-900">{t('onSaleOnly')}</label>
                </div>
            </div>
        </div>
    );
}
