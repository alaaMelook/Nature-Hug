'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Material } from '@/domain/entities/database/material';
import { getMaterialsAction, addMaterialAction } from '@/ui/hooks/admin/materials';
import { toast } from 'sonner';
import { Plus, Search, X, Check, Loader2 } from 'lucide-react';

interface MaterialSelectorProps {
    onSelect: (material: Material, amount: number) => void;
    onClose: () => void;
}

export function MaterialSelector({ onSelect, onClose }: MaterialSelectorProps) {
    const { t } = useTranslation();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // New Material Form State
    const [newMaterialName, setNewMaterialName] = useState('');
    const [newMaterialPrice, setNewMaterialPrice] = useState('');
    const [newMaterialStock, setNewMaterialStock] = useState('');
    const [creating, setCreating] = useState(false);

    // Selection State
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        const result = await getMaterialsAction();
        if (result.success && result.materials) {
            setMaterials(result.materials);
        } else {
            toast.error(t('errorFetchingMaterials'));
        }
        setLoading(false);
    };

    const handleCreateMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMaterialName || !newMaterialPrice || !newMaterialStock) return;

        setCreating(true);
        const newMaterial: Partial<Material> = {
            name: newMaterialName,
            price_per_gram: parseFloat(newMaterialPrice),
            stock_grams: parseFloat(newMaterialStock),
            unit: 'gm' // Default unit
        };

        const result = await addMaterialAction(newMaterial);
        if (result.success) {
            toast.success(t('materialCreated'));
            setShowAddForm(false);
            setNewMaterialName('');
            setNewMaterialPrice('');
            setNewMaterialStock('');
            fetchMaterials(); // Refresh list
        } else {
            toast.error(t('errorCreatingMaterial'));
        }
        setCreating(false);
    };

    const handleConfirmSelection = () => {
        if (selectedMaterial && amount) {
            onSelect(selectedMaterial, parseFloat(amount));
            onClose();
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{t('selectMaterial')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showAddForm ? (
                        <>
                            {/* Search and Add Button */}
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder={t('searchMaterials')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Plus size={18} /> {t('addNew')}
                                </button>
                            </div>

                            {/* Materials List */}
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-blue-500" size={32} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredMaterials.map(material => (
                                        <div
                                            key={material.id}
                                            onClick={() => setSelectedMaterial(material)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${selectedMaterial?.id === material.id
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{material.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {t('{{price, currency}}', { price: material.price_per_gram })} / {material.unit} • Stock: {material.stock_grams}
                                                </p>
                                            </div>
                                            {selectedMaterial?.id === material.id && (
                                                <Check className="text-blue-600" size={20} />
                                            )}
                                        </div>
                                    ))}
                                    {filteredMaterials.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">{t('noMaterialsFound')}</p>
                                    )}
                                </div>
                            )}

                            {/* Amount Input for Selected */}
                            {selectedMaterial && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('amountUsed')} ({selectedMaterial.unit})
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            autoFocus
                                        />
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase">{t('cost')}</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {t('{{price, currency}}', { price: amount ? parseFloat(amount) * selectedMaterial.price_per_gram : 0 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Add New Material Form */
                        <form onSubmit={handleCreateMaterial} className="space-y-4">
                            <h3 className="font-semibold text-lg mb-4">{t('createNewMaterial')}</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('materialName')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newMaterialName}
                                    onChange={(e) => setNewMaterialName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('pricePerGram')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newMaterialPrice}
                                        onChange={(e) => setNewMaterialPrice(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('stockGrams')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newMaterialStock}
                                        onChange={(e) => setNewMaterialStock(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creating && <Loader2 className="animate-spin" size={16} />}
                                    {t('create')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                {!showAddForm && (
                    <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={handleConfirmSelection}
                            disabled={!selectedMaterial || !amount}
                            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 shadow-sm"
                        >
                            {t('addMaterial')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
