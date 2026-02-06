"use client";

import { useState } from "react";
import { Theme } from "@/domain/entities/database/theme";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    Palette, Plus, Trash2, Check, Heart, Moon, PartyPopper,
    Sparkles, Calendar, Edit2, Power, Upload, Image
} from "lucide-react";
import { toast } from "sonner";

interface ThemesScreenProps {
    initialThemes: Theme[];
}

const decorationIcons: Record<string, React.ReactNode> = {
    hearts: <Heart className="w-5 h-5 text-red-500" />,
    lanterns: <Moon className="w-5 h-5 text-yellow-500" />,
    balloons: <PartyPopper className="w-5 h-5 text-orange-500" />,
    confetti: <Sparkles className="w-5 h-5 text-purple-500" />,
    stars: <Sparkles className="w-5 h-5 text-blue-500" />,
    custom: <Image className="w-5 h-5 text-green-500" />,
};

export function ThemesScreen({ initialThemes }: ThemesScreenProps) {
    const { t, i18n } = useTranslation();
    const [themes, setThemes] = useState<Theme[]>(initialThemes);
    const [isCreating, setIsCreating] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

    const handleActivate = async (themeId: number) => {
        try {
            const res = await fetch(`/api/admin/themes/${themeId}`, { method: 'PATCH' });
            if (!res.ok) throw new Error('Failed to activate theme');

            // Update local state
            setThemes(prev => prev.map(t => ({
                ...t,
                is_active: t.id === themeId
            })));

            toast.success(t('themeActivated') || 'Theme activated!');
        } catch (error) {
            toast.error(t('failedToActivateTheme') || 'Failed to activate theme');
        }
    };

    const handleDelete = async (themeId: number) => {
        if (!confirm(t('confirmDeleteTheme') || 'Are you sure you want to delete this theme?')) return;

        try {
            const res = await fetch(`/api/admin/themes/${themeId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete theme');

            setThemes(prev => prev.filter(t => t.id !== themeId));
            toast.success(t('themeDeleted') || 'Theme deleted!');
        } catch (error) {
            toast.error(t('failedToDeleteTheme') || 'Failed to delete theme');
        }
    };

    const handleSaveTheme = async (theme: Partial<Theme>) => {
        try {
            const isEdit = !!theme.id;
            const res = await fetch(
                isEdit ? `/api/admin/themes/${theme.id}` : '/api/admin/themes',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(theme),
                }
            );

            if (!res.ok) throw new Error('Failed to save theme');

            const { theme: savedTheme } = await res.json();

            if (isEdit) {
                setThemes(prev => prev.map(t => t.id === savedTheme.id ? savedTheme : t));
            } else {
                setThemes(prev => [...prev, savedTheme]);
            }

            setIsCreating(false);
            setEditingTheme(null);
            toast.success(t('themeSaved') || 'Theme saved!');
        } catch (error) {
            toast.error(t('failedToSaveTheme') || 'Failed to save theme');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto" dir={i18n.dir()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Palette className="w-7 h-7 text-primary-600" />
                        {t('siteThemes') || 'Site Themes'}
                    </h1>
                    <p className="text-gray-500 mt-1">{t('manageThemes') || 'Manage seasonal themes and decorations'}</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {t('createTheme') || 'Create Theme'}
                </button>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme, index) => (
                    <motion.div
                        key={theme.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all
                            ${theme.is_active ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                        {/* Active Badge */}
                        {theme.is_active && (
                            <div className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {t('active') || 'نشط'}
                            </div>
                        )}

                        {/* Theme Preview */}
                        <div
                            className="h-32 relative flex items-center justify-center"
                            style={{ backgroundColor: theme.primary_color + '20' }}
                        >
                            {/* Color Swatches */}
                            <div className="flex gap-2">
                                <div
                                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                                    style={{ backgroundColor: theme.primary_color }}
                                />
                                {theme.secondary_color && (
                                    <div
                                        className="w-10 h-10 rounded-full border-4 border-white shadow-lg"
                                        style={{ backgroundColor: theme.secondary_color }}
                                    />
                                )}
                            </div>

                            {/* Decoration Icon */}
                            {theme.decoration_type && (
                                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full">
                                    {decorationIcons[theme.decoration_type]}
                                </div>
                            )}
                        </div>

                        {/* Theme Info */}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {i18n.language === 'ar' ? theme.name_ar || theme.name : theme.name}
                            </h3>

                            {/* Decoration Type */}
                            {theme.decoration_type && (
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    {decorationIcons[theme.decoration_type]}
                                    {theme.decoration_type === 'hearts' && (t('floatingHearts') || 'قلوب متحركة')}
                                    {theme.decoration_type === 'lanterns' && (t('floatingLanterns') || 'فوانيس متحركة')}
                                    {theme.decoration_type === 'balloons' && (t('floatingBalloons') || 'بالونات متحركة')}
                                </p>
                            )}

                            {/* Schedule */}
                            {theme.valid_from && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(theme.valid_from).toLocaleDateString()}
                                    {theme.valid_until && ` - ${new Date(theme.valid_until).toLocaleDateString()}`}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                {!theme.is_active && (
                                    <button
                                        onClick={() => handleActivate(theme.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                                    >
                                        <Power className="w-4 h-4" />
                                        {t('activate') || 'تفعيل'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditingTheme(theme)}
                                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {!theme.is_active && theme.name !== 'Default' && (
                                    <button
                                        onClick={() => handleDelete(theme.id)}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {(isCreating || editingTheme) && (
                <ThemeFormModal
                    theme={editingTheme}
                    onSave={handleSaveTheme}
                    onClose={() => { setIsCreating(false); setEditingTheme(null); }}
                />
            )}
        </div>
    );
}

// Theme Form Modal Component
function ThemeFormModal({
    theme,
    onSave,
    onClose
}: {
    theme: Theme | null;
    onSave: (theme: Partial<Theme>) => void;
    onClose: () => void;
}) {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState<Partial<Theme>>(theme || {
        name: '',
        name_ar: '',
        is_active: false,
        primary_color: '#66BB6A',
        secondary_color: '#4CAF50',
        decoration_type: null,
        decoration_color: '#FF0000',
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                dir={i18n.dir()}
            >
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {theme ? (t('editTheme') || 'تعديل السمة') : (t('createTheme') || 'إنشاء سمة')}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('themeNameEn') || 'Name (English)'}
                            </label>
                            <input
                                type="text"
                                value={form.name || ''}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('themeNameAr') || 'Arabic Name'}
                            </label>
                            <input
                                type="text"
                                value={form.name_ar || ''}
                                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {/* Decoration Types - Multi-Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('decorationTypes') || 'أنواع الديكور'} <span className="text-gray-400 font-normal">({t('selectMultiple') || 'اختاري أكتر من واحد'})</span>
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {[
                                { value: 'hearts', label: 'قلوب', icon: <Heart className="w-5 h-5 text-red-500" /> },
                                { value: 'lanterns', label: 'نجوم', icon: <Moon className="w-5 h-5 text-yellow-500" /> },
                                { value: 'balloons', label: 'بالونات', icon: <PartyPopper className="w-5 h-5 text-orange-500" /> },
                                { value: 'confetti', label: 'كونفتي', icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
                                { value: 'custom', label: 'صورة', icon: <Upload className="w-5 h-5 text-green-500" /> },
                            ].map((option) => {
                                const isSelected = form.decoration_types?.includes(option.value) || false;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            const current = form.decoration_types || [];
                                            const newTypes = isSelected
                                                ? current.filter(t => t !== option.value)
                                                : [...current, option.value];
                                            setForm({
                                                ...form,
                                                decoration_types: newTypes,
                                                decoration_type: newTypes[0] as any || null // Keep backward compatibility
                                            });
                                        }}
                                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all relative
                                            ${isSelected
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        {option.icon}
                                        <span className="text-xs">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {/* Custom Decorations - Multiple Images with Individual Settings */}
                    {form.decoration_types?.includes('custom') && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">
                                    Custom Images
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newItem = {
                                            id: Date.now().toString(),
                                            url: '',
                                            mode: 'static' as const,
                                            position: 'top-right' as const,
                                            size: 'medium' as const,
                                            rotation: 0,
                                            flip_horizontal: false,
                                            flip_vertical: false,
                                        };
                                        setForm({
                                            ...form,
                                            custom_decorations: [...(form.custom_decorations || []), newItem]
                                        });
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Image
                                </button>
                            </div>

                            {/* List of custom decorations */}
                            {(form.custom_decorations || []).map((decoration, index) => (
                                <div key={decoration.id} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <span className="text-sm font-medium text-gray-600">Image {index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm({
                                                    ...form,
                                                    custom_decorations: form.custom_decorations?.filter(d => d.id !== decoration.id)
                                                });
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* URL Input */}
                                    <div className="flex items-center gap-2">
                                        {decoration.url && (
                                            <img src={decoration.url} alt="" className="w-12 h-12 object-contain rounded border" />
                                        )}
                                        <input
                                            type="url"
                                            placeholder="Image URL (transparent PNG)"
                                            value={decoration.url}
                                            onChange={(e) => {
                                                const updated = form.custom_decorations?.map(d =>
                                                    d.id === decoration.id ? { ...d, url: e.target.value } : d
                                                );
                                                setForm({ ...form, custom_decorations: updated });
                                            }}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>

                                    {/* Mode: Static or Animated */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = form.custom_decorations?.map(d =>
                                                    d.id === decoration.id ? { ...d, mode: 'animated' as const } : d
                                                );
                                                setForm({ ...form, custom_decorations: updated });
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm border-2 ${decoration.mode === 'animated' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                                        >
                                            🎭 Animated
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = form.custom_decorations?.map(d =>
                                                    d.id === decoration.id ? { ...d, mode: 'static' as const } : d
                                                );
                                                setForm({ ...form, custom_decorations: updated });
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm border-2 ${decoration.mode === 'static' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                                        >
                                            📌 Static
                                        </button>
                                    </div>

                                    {/* Position (only for static) */}
                                    {decoration.mode === 'static' && (
                                        <div className="grid grid-cols-5 gap-1">
                                            {[
                                                { value: 'top-left', icon: '↖️' },
                                                { value: 'top-right', icon: '↗️' },
                                                { value: 'corners', icon: '🔲' },
                                                { value: 'bottom-left', icon: '↙️' },
                                                { value: 'bottom-right', icon: '↘️' },
                                            ].map((pos) => (
                                                <button
                                                    key={pos.value}
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = form.custom_decorations?.map(d =>
                                                            d.id === decoration.id ? { ...d, position: pos.value as any } : d
                                                        );
                                                        setForm({ ...form, custom_decorations: updated });
                                                    }}
                                                    className={`p-2 rounded text-center border-2 ${decoration.position === pos.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                                                >
                                                    {pos.icon}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Size */}
                                    <div className="grid grid-cols-4 gap-1">
                                        {[
                                            { value: 'small', label: 'S' },
                                            { value: 'medium', label: 'M' },
                                            { value: 'large', label: 'L' },
                                            { value: 'xlarge', label: 'XL' },
                                        ].map((size) => (
                                            <button
                                                key={size.value}
                                                type="button"
                                                onClick={() => {
                                                    const updated = form.custom_decorations?.map(d =>
                                                        d.id === decoration.id ? { ...d, size: size.value as any } : d
                                                    );
                                                    setForm({ ...form, custom_decorations: updated });
                                                }}
                                                className={`px-2 py-1.5 rounded text-sm border-2 ${(decoration.size || 'medium') === size.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                                            >
                                                {size.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Flip Controls */}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = form.custom_decorations?.map(d =>
                                                    d.id === decoration.id ? { ...d, flip_horizontal: !d.flip_horizontal } : d
                                                );
                                                setForm({ ...form, custom_decorations: updated });
                                            }}
                                            className={`px-3 py-1.5 rounded text-sm border-2 ${decoration.flip_horizontal ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                                        >
                                            ↔️ قلب أفقي
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = form.custom_decorations?.map(d =>
                                                    d.id === decoration.id ? { ...d, flip_vertical: !d.flip_vertical } : d
                                                );
                                                setForm({ ...form, custom_decorations: updated });
                                            }}
                                            className={`px-3 py-1.5 rounded text-sm border-2 ${decoration.flip_vertical ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                                        >
                                            ↕️ قلب رأسي
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {(!form.custom_decorations || form.custom_decorations.length === 0) && (
                                <p className="text-center text-gray-400 py-4">اضغطي "إضافة صورة" لإضافة ديكور جديد</p>
                            )}
                        </div>
                    )}

                    {/* Decoration Color */}
                    {form.decoration_type && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('decorationColor') || 'لون الديكور'}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={form.decoration_color || '#FF0000'}
                                    onChange={(e) => setForm({ ...form, decoration_color: e.target.value })}
                                    className="w-12 h-10 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={form.decoration_color || ''}
                                    onChange={(e) => setForm({ ...form, decoration_color: e.target.value })}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Announcement Bar */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700">
                                {i18n.language === 'ar' ? 'شريط الإعلان' : 'Announcement Bar'}
                                <span className="text-gray-400 font-normal ms-1">
                                    ({i18n.language === 'ar' ? 'يظهر أسفل الصفحة' : 'appears at bottom'})
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, show_announcement: !form.show_announcement })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${form.show_announcement ? 'bg-primary-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${form.show_announcement ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {form.show_announcement && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            {i18n.language === 'ar' ? 'النص (عربي)' : 'Text (Arabic)'}
                                        </label>
                                        <input
                                            type="text"
                                            value={form.announcement_text_ar || ''}
                                            onChange={(e) => setForm({ ...form, announcement_text_ar: e.target.value })}
                                            placeholder={i18n.language === 'ar' ? 'مثال: خصم 20% على كل المنتجات 🎉' : 'e.g. 20% off all products 🎉'}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            dir="rtl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            {i18n.language === 'ar' ? 'النص (انجليزي)' : 'Text (English)'}
                                        </label>
                                        <input
                                            type="text"
                                            value={form.announcement_text || ''}
                                            onChange={(e) => setForm({ ...form, announcement_text: e.target.value })}
                                            placeholder={i18n.language === 'ar' ? 'مثال: 20% off all products 🎉' : 'e.g. 20% off all products 🎉'}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            {i18n.language === 'ar' ? 'لون الخلفية' : 'Background Color'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.announcement_bg_color || '#E91E63'}
                                                onChange={(e) => setForm({ ...form, announcement_bg_color: e.target.value })}
                                                className="w-10 h-8 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={form.announcement_bg_color || '#E91E63'}
                                                onChange={(e) => setForm({ ...form, announcement_bg_color: e.target.value })}
                                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            {i18n.language === 'ar' ? 'لون النص' : 'Text Color'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.announcement_text_color || '#FFFFFF'}
                                                onChange={(e) => setForm({ ...form, announcement_text_color: e.target.value })}
                                                className="w-10 h-8 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={form.announcement_text_color || '#FFFFFF'}
                                                onChange={(e) => setForm({ ...form, announcement_text_color: e.target.value })}
                                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Countdown Timer */}
                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                                    <label className="flex items-center gap-2 text-sm font-medium text-orange-700 mb-2">
                                        ⏱️ {i18n.language === 'ar' ? 'العد التنازلي' : 'Countdown Timer'}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.announcement_countdown_end ? new Date(form.announcement_countdown_end).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => setForm({ ...form, announcement_countdown_end: e.target.value || undefined })}
                                        className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white"
                                    />
                                    <p className="text-xs text-orange-600 mt-1">
                                        {i18n.language === 'ar'
                                            ? '⚡ الشريط سيختفي تلقائياً عند انتهاء الوقت'
                                            : '⚡ Bar will auto-hide when countdown ends'}
                                    </p>
                                </div>

                                {/* Scroll Speed */}
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">
                                        {i18n.language === 'ar' ? 'سرعة التمرير' : 'Scroll Speed'}
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'slow', label: i18n.language === 'ar' ? '🐢 بطيء' : '🐢 Slow' },
                                            { value: 'medium', label: i18n.language === 'ar' ? '🚶 متوسط' : '🚶 Medium' },
                                            { value: 'fast', label: i18n.language === 'ar' ? '🏃 سريع' : '🏃 Fast' },
                                        ].map((speed) => (
                                            <button
                                                key={speed.value}
                                                type="button"
                                                onClick={() => setForm({ ...form, announcement_scroll_speed: speed.value as any })}
                                                className={`px-3 py-2 rounded-lg text-sm border-2 transition-all ${(form.announcement_scroll_speed || 'medium') === speed.value
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {speed.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Schedule (Optional) */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('schedule') || 'الجدولة'} <span className="text-gray-400 font-normal">({t('optional') || 'اختياري'})</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('validFrom') || 'من'}</label>
                                <input
                                    type="datetime-local"
                                    value={form.valid_from ? new Date(form.valid_from).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setForm({ ...form, valid_from: e.target.value || undefined })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('validUntil') || 'إلى'}</label>
                                <input
                                    type="datetime-local"
                                    value={form.valid_until ? new Date(form.valid_until).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setForm({ ...form, valid_until: e.target.value || undefined })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        {t('cancel') || 'إلغاء'}
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        {t('save') || 'حفظ'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
