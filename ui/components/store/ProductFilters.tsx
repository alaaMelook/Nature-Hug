'use client';

import { Category } from "@/domain/entities/database/category";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ArrowDownUp, ListFilter, SortAscIcon } from "lucide-react";
import { useCurrentLanguage } from "@/ui/hooks/useCurrentLanguage";

export default function ProductFilters({ onFilterChangeAction, initCategories }: {
    onFilterChangeAction: (filters: any) => void,
    initCategories: Category[]
}) {
    const { t, i18n } = useTranslation();
    const language = useCurrentLanguage();
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    const toggleSortMenu = () => {
        setSortMenuOpen(!sortMenuOpen);
        setFilterMenuOpen(false);
    }
    const toggleFilterMenu = () => {
        setFilterMenuOpen(!filterMenuOpen);
        setSortMenuOpen(false);
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        onFilterChangeAction({ [name]: isCheckbox ? checked : value });
    };
    let categories: Category[] = initCategories;
    console.log('Categories:', categories);
    return (
        <>

            <div className="p-6 rounded-lg shadow-lg h-3/5 hidden sm:block">
                <h3 className="text-xl font-semibold mb-4">{t('filters')}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">{t('search')}</label>
                        <input
                            type="text"
                            id="search"
                            placeholder={t('search')}
                            enterKeyHint="search"
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
                                    value={category.name_en}> {language === 'en' ? category.name_en : category.name_ar.length === 0 ? category.name_en : category.name_ar}</option>
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
            <div className="sm:hidden" >
                <div>
                    {/* <label htmlFor="search" className="block text-sm font-medium text-gray-700">{t('search')}</label> */}
                    <input
                        type="text"
                        enterKeyHint="search"
                        id="search"
                        name="search"
                        placeholder={t('search')}
                        onChange={handleInputChange}
                        className="mb-5 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>
                <div className="fixed bottom-5 left-0 right-0  z-50 " dir="ltr">

                    <div className="flex items-center justify-center gap-15">

                        {/* 1. Sort Button and Dropdown */}
                        <div className="relative"> {/* Added relative wrapper for positioning */}
                            <button
                                className="bg-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center" // Used standard sizes
                                onClick={toggleSortMenu}
                            >
                                <ArrowDownUp className="w-6 h-6 text-white" />
                            </button>


                        </div>

                        {/* 2. Filter Button and Dropdown */}
                        <div className="relative"> {/* Added relative wrapper for positioning */}
                            <button
                                className="bg-primary-600 p-3 rounded-full w-12 h-12 flex items-center justify-center" // Used standard sizes
                                onClick={toggleFilterMenu}
                            >
                                <ListFilter className="w-6 h-6 text-white" />
                            </button>
                            {sortMenuOpen && (
                                <div dir={i18n.dir()}
                                    className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl p-4 w-48 z-10"
                                // The 'right-0' aligns the right edge of the dropdown with the right edge of the button
                                >  <div>
                                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">{t('sortBy')}</label>
                                        <select
                                            id="sortBy"
                                            name="sortBy"
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full px-2 py-2 mx-2 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm rounded-md"
                                        >
                                            <option value="name-asc">{t('nameAsc')}</option>
                                            <option value="name-desc">{t('nameDesc')}</option>
                                            <option value="price-asc">{t('priceAsc')}</option>
                                            <option value="price-desc">{t('priceDesc')}</option>
                                            <option value="rating-desc">{t('ratingDesc')}</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            {filterMenuOpen && (
                                <div dir={i18n.dir()}
                                    className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl p-4 w-60 z-10"
                                // Increased width for filters and added z-index to ensure visibility
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="category"
                                                className="block text-sm font-medium text-gray-700"
                                            >
                                                {t('category')}
                                            </label>
                                            <select
                                                id="category"
                                                name="category"
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full px-5 py-2  border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm rounded-md"
                                            >
                                                <option value="">{t('all')}</option>
                                                {categories?.map(category => (
                                                    <option
                                                        key={category.id}
                                                        value={category.name_en}
                                                    >
                                                        {/* Using language state to choose display name */}
                                                        {language === 'en'
                                                            ? category.name_en
                                                            : category.name_ar.length === 0
                                                                ? category.name_en
                                                                : category.name_ar
                                                        }
                                                    </option>
                                                ))}
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
                                        {/* Additional filter options can go here */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
