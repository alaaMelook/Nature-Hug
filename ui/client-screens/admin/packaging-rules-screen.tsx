"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Package, Plus, Trash2, Save, Loader2, ChevronDown,
    Check, X, ToggleLeft, ToggleRight, Search
} from "lucide-react";
import { Material } from "@/domain/entities/database/material";
import { PackagingRule } from "@/domain/entities/database/packagingRule";

interface ProductOption {
    id: number;
    name: string;
    isVariant?: boolean;
    parentName?: string;
}

interface PackagingRulesScreenProps {
    initialMaterials: Material[];
    initialProducts: ProductOption[];
}

export default function PackagingRulesScreen({ initialMaterials, initialProducts }: PackagingRulesScreenProps) {
    const [rules, setRules] = useState<PackagingRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);

    // Filter materials to only show packaging type
    const packagingMaterials = initialMaterials.filter(m =>
        m.material_type?.toLowerCase() === 'packaging'
    );

    // New rule form state
    const [showNewForm, setShowNewForm] = useState(false);
    const [newRule, setNewRule] = useState<Partial<PackagingRule>>({
        material_id: 0,
        deduction_type: 'per_order',
        applies_to: 'all',
        quantity_single: 0,
        quantity_multiple: 0,
        is_active: true,
        product_ids: [],
    });

    // Fetch rules on mount
    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/admin/packaging-rules');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRules(data);
            }
        } catch (error) {
            console.error("Failed to fetch packaging rules:", error);
            toast.error("Failed to load packaging rules");
        } finally {
            setLoading(false);
        }
    };

    const saveRule = async (rule: Partial<PackagingRule>) => {
        const id = rule.id || -1;
        setSavingId(id);
        try {
            const res = await fetch('/api/admin/packaging-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(rule.id ? "Rule updated!" : "Rule created!");
                await fetchRules();
                if (!rule.id) {
                    setShowNewForm(false);
                    setNewRule({
                        material_id: 0,
                        deduction_type: 'per_order',
                        applies_to: 'all',
                        quantity_single: 0,
                        quantity_multiple: 0,
                        is_active: true,
                        product_ids: [],
                    });
                }
            } else {
                toast.error(data.error || "Failed to save rule");
            }
        } catch (error) {
            toast.error("Failed to save rule");
        } finally {
            setSavingId(null);
        }
    };

    const deleteRule = async (id: number) => {
        if (!confirm("Are you sure you want to delete this rule?")) return;
        try {
            const res = await fetch(`/api/admin/packaging-rules?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success("Rule deleted!");
                setRules(prev => prev.filter(r => r.id !== id));
            } else {
                toast.error(data.error || "Failed to delete rule");
            }
        } catch (error) {
            toast.error("Failed to delete rule");
        }
    };

    const updateRuleField = (index: number, field: string, value: any) => {
        setRules(prev => {
            const updated = [...prev];
            (updated[index] as any)[field] = value;
            return updated;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-6 max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary-600" />
                        Packaging Rules
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure which packaging materials are deducted per order
                    </p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Rule</span>
                </button>
            </div>

            {/* New Rule Form */}
            <AnimatePresence>
                {showNewForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <RuleCard
                            rule={newRule}
                            materials={packagingMaterials}
                            products={initialProducts}
                            isNew
                            saving={savingId === -1}
                            onSave={() => saveRule(newRule)}
                            onCancel={() => setShowNewForm(false)}
                            onChange={(field, value) => setNewRule(prev => ({ ...prev, [field]: value }))}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rules List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {rules.length > 0 ? (
                        rules.map((rule, index) => (
                            <motion.div
                                key={rule.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <RuleCard
                                    rule={rule}
                                    materials={packagingMaterials}
                                    products={initialProducts}
                                    saving={savingId === rule.id}
                                    onSave={() => saveRule(rule)}
                                    onDelete={() => deleteRule(rule.id)}
                                    onChange={(field, value) => updateRuleField(index, field, value)}
                                />
                            </motion.div>
                        ))
                    ) : (
                        !showNewForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300"
                            >
                                <Package className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No packaging rules yet</p>
                                <p className="text-gray-400 text-sm mt-1">Click "Add Rule" to get started</p>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─── Rule Card Component ─────────────────────────────────────────────────────

interface RuleCardProps {
    rule: Partial<PackagingRule>;
    materials: Material[];
    products: ProductOption[];
    isNew?: boolean;
    saving: boolean;
    onSave: () => void;
    onDelete?: () => void;
    onCancel?: () => void;
    onChange: (field: string, value: any) => void;
}

function RuleCard({ rule, materials, products, isNew, saving, onSave, onDelete, onCancel, onChange }: RuleCardProps) {
    const [expanded, setExpanded] = useState(!!isNew);
    const [productSearch, setProductSearch] = useState("");

    const materialName = rule.material_name ||
        materials.find(m => m.id === rule.material_id)?.name || '';

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const toggleProduct = (productId: number) => {
        const current = rule.product_ids || [];
        const clickedProduct = products.find(p => p.id === productId);
        const isBaseProduct = clickedProduct && !clickedProduct.isVariant;

        if (current.includes(productId)) {
            // Unchecking
            if (isBaseProduct) {
                // Uncheck base product AND all its variants
                const variantIds = products
                    .filter(p => p.isVariant && p.parentName === clickedProduct.name)
                    .map(p => p.id);
                const idsToRemove = new Set([productId, ...variantIds]);
                onChange('product_ids', current.filter(id => !idsToRemove.has(id)));
            } else {
                onChange('product_ids', current.filter(id => id !== productId));
            }
        } else {
            // Checking
            if (isBaseProduct) {
                // Check base product AND all its variants
                const variantIds = products
                    .filter(p => p.isVariant && p.parentName === clickedProduct.name)
                    .map(p => p.id);
                const newIds = new Set([...current, productId, ...variantIds]);
                onChange('product_ids', Array.from(newIds));
            } else {
                onChange('product_ids', [...current, productId]);
            }
        }
    };

    const isValid = (rule.material_id ?? 0) > 0;

    // ─── Collapsed Row (for existing rules) ───
    if (!isNew && !expanded) {
        return (
            <div
                onClick={() => setExpanded(true)}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
            >
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rule.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                            <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {materialName || 'Unnamed Rule'}
                            </h3>
                        </div>
                    </div>

                    {/* Summary badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {rule.deduction_type === 'per_order' ? 'Per Order' : 'Per Item'}
                        </span>
                        <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {rule.applies_to === 'all' ? 'All Products' : `${(rule.product_ids || []).length} products`}
                        </span>
                        <span className="hidden md:inline-flex text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            Qty: {rule.quantity_single ?? 0} / {rule.quantity_multiple ?? 0}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Expanded Card (for new rules or when editing) ───
    return (
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isNew ? 'border-primary-300 ring-2 ring-primary-100' : 'border-primary-200 shadow-md'}`}>
            {/* Card Header */}
            <div
                className={`px-4 py-3 flex items-center justify-between ${isNew ? 'bg-primary-50' : 'bg-gray-50'} border-b ${!isNew ? 'cursor-pointer' : ''}`}
                onClick={!isNew ? () => setExpanded(false) : undefined}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isNew ? 'bg-primary-100 text-primary-600' : rule.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                        <Package className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                            {isNew ? 'New Packaging Rule' : materialName || 'Unnamed Rule'}
                        </h3>
                        {!isNew && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Active Toggle for existing rules */}
                    {!isNew && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange('is_active', !rule.is_active); }}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title={rule.is_active ? 'Deactivate' : 'Activate'}
                        >
                            {rule.is_active ? (
                                <ToggleRight className="w-7 h-7 text-green-500" />
                            ) : (
                                <ToggleLeft className="w-7 h-7 text-gray-400" />
                            )}
                        </button>
                    )}
                    {!isNew && (
                        <ChevronDown className="w-4 h-4 text-gray-400 rotate-180 transition-transform" />
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4">
                {/* Row 1: Material Selection (only for new rules) */}
                {isNew && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Packaging Material
                        </label>
                        <select
                            value={rule.material_id || 0}
                            onChange={(e) => onChange('material_id', parseInt(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                            <option value={0}>Select material...</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name} (Stock: {m.stock_grams} {m.unit})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Row 2: Deduction Type & Applies To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Deduction Type */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Deduction Type
                        </label>
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => onChange('deduction_type', 'per_order')}
                                className={`flex-1 px-3 py-2 text-xs md:text-sm font-medium transition-all ${rule.deduction_type === 'per_order'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Per Order
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange('deduction_type', 'per_item')}
                                className={`flex-1 px-3 py-2 text-xs md:text-sm font-medium transition-all border-l ${rule.deduction_type === 'per_item'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Per Item
                            </button>
                        </div>
                    </div>

                    {/* Applies To */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Applies To
                        </label>
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => onChange('applies_to', 'all')}
                                className={`flex-1 px-3 py-2 text-xs md:text-sm font-medium transition-all ${rule.applies_to === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                All Products
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange('applies_to', 'specific')}
                                className={`flex-1 px-3 py-2 text-xs md:text-sm font-medium transition-all border-l ${rule.applies_to === 'specific'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Specific
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 3: Quantity Rules */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Qty (1 item)
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={rule.quantity_single ?? 0}
                            onChange={(e) => onChange('quantity_single', parseInt(e.target.value) || 0)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Qty (&gt;1 items)
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={rule.quantity_multiple ?? 0}
                            onChange={(e) => onChange('quantity_multiple', parseInt(e.target.value) || 0)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Row 4: Product Selection (only when applies_to = specific) */}
                <AnimatePresence>
                    {rule.applies_to === 'specific' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Select Products ({(rule.product_ids || []).length} selected)
                            </label>

                            {/* Selected Products Tags */}
                            {(rule.product_ids || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {(rule.product_ids || []).map(pid => {
                                        const product = products.find(p => p.id === pid);
                                        const name = product?.name || rule.product_names?.find((_, i) => (rule.product_ids || [])[i] === pid) || `#${pid}`;
                                        return (
                                            <span
                                                key={pid}
                                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200"
                                            >
                                                {name}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleProduct(pid)}
                                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Product Search & List Panel */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                {/* Search Bar */}
                                <div className="p-2.5 border-b bg-gray-50">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Product List */}
                                <div className="overflow-auto max-h-60 md:max-h-72 divide-y divide-gray-100">
                                    {filteredProducts.map(product => {
                                        const isSelected = (rule.product_ids || []).includes(product.id);
                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => toggleProduct(product.id)}
                                                className={`px-3 py-2.5 cursor-pointer flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50/60' : ''} ${product.isVariant ? 'pl-8' : ''}`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                                    ? 'bg-primary-600 border-primary-600'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                                </div>
                                                <span className={`${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'} truncate`}>
                                                    {product.isVariant ? `↳ ${product.name}` : product.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {filteredProducts.length === 0 && (
                                        <div className="px-3 py-8 text-sm text-gray-400 text-center">
                                            No products found
                                        </div>
                                    )}
                                </div>

                                {/* Footer with count */}
                                {products.length > 5 && (
                                    <div className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-400">
                                        Showing {filteredProducts.length} of {products.length} products
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between gap-2">
                {isNew ? (
                    <>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={!isValid || saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all font-medium"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Create Rule
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-all font-medium"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

