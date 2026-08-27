"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
    Settings,
    Share2,
    Instagram,
    Facebook,
    Save,
    ExternalLink,
    CheckCircle2,
    Eye,
    EyeOff,
    Sparkles,
    Globe
} from "lucide-react";
import { TikTokIcon } from "@/ui/components/icons/TikTokIcon";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/domain/entities/database/settings";
import { toast } from "sonner";

interface SettingsScreenProps {
    initialSettings: StoreSettings;
    isAdmin?: boolean;
}

export function SettingsScreen({ initialSettings, isAdmin = true }: SettingsScreenProps) {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState<StoreSettings>(initialSettings || DEFAULT_STORE_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleMedia = async (checked: boolean) => {
        const newSettings = { ...settings, show_social_media: checked };
        setSettings(newSettings);

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ show_social_media: checked }),
            });

            if (!res.ok) throw new Error("Failed to update");
            toast.success(
                checked
                    ? (t("socialMediaEnabled") || "Social media buttons are now visible on Home")
                    : (t("socialMediaDisabled") || "Social media buttons are now hidden from Home")
            );
        } catch (error) {
            // Revert on error
            setSettings(settings);
            toast.error(t("settingsUpdateFailed") || "Failed to update media status");
        }
    };

    const handleSaveAll = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (!res.ok) throw new Error("Failed to save settings");
            const data = await res.json();
            if (data.settings) {
                setSettings(data.settings);
            }
            toast.success(t("settingsUpdated") || "Settings saved successfully!");
        } catch (error) {
            toast.error(t("settingsUpdateFailed") || "Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto" dir={i18n.dir()}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2.5 bg-primary-100 text-primary-800 rounded-xl shadow-sm">
                            <Settings className="w-7 h-7" />
                        </div>
                        <span>{t("settings") || "Store Settings"}</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {t("manageMediaSettings") || "Manage store settings, social media links, and visibility on the home page."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSaveAll} className="space-y-8">
                {/* Media & Social Links Card */}
                <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    {/* Card Header with Switch */}
                    <div className="p-6 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-gradient-to-tr from-pink-500 via-red-500 to-amber-400 text-white rounded-xl shadow-md">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {t("socialMediaNav") || "Media"} - {t("socialMedia") || "Social Media"}
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            settings.show_social_media
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-gray-100 text-gray-600 border border-gray-200"
                                        }`}
                                    >
                                        {settings.show_social_media ? (
                                            <>
                                                <Eye className="w-3 h-3" />
                                                {i18n.language === "ar" ? "ظاهر في الرئيسية" : "Active on Home"}
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-3 h-3" />
                                                {i18n.language === "ar" ? "مخفي" : "Hidden"}
                                            </>
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {t("showSocialMediaDesc") || "Display Instagram, Facebook, and TikTok buttons on the home hero section"}
                                </p>
                            </div>
                        </div>

                        {/* Switch Button */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                            <span className="text-sm font-medium text-gray-700">
                                {settings.show_social_media
                                    ? (i18n.language === "ar" ? "مفعل" : "Enabled")
                                    : (i18n.language === "ar" ? "معطل" : "Disabled")}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="media_switch"
                                    checked={settings.show_social_media}
                                    onChange={(e) => handleToggleMedia(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-900"></div>
                            </label>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 space-y-6">
                        {/* Links Inputs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Instagram */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-pink-200 transition-colors">
                                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <span>{t("instagramUrl") || "Instagram URL"}</span>
                                    </span>
                                    {settings.instagram_url && (
                                        <a
                                            href={settings.instagram_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-pink-600 hover:text-pink-700 text-xs flex items-center gap-1 font-normal hover:underline"
                                            title="Test link"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            {i18n.language === "ar" ? "فتح" : "Open"}
                                        </a>
                                    )}
                                </label>
                                <input
                                    type="url"
                                    value={settings.instagram_url}
                                    onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                    placeholder="https://www.instagram.com/..."
                                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all font-mono"
                                    dir="ltr"
                                />
                            </div>

                            {/* Facebook */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                            <Facebook className="w-4 h-4" />
                                        </div>
                                        <span>{t("facebookUrl") || "Facebook URL"}</span>
                                    </span>
                                    {settings.facebook_url && (
                                        <a
                                            href={settings.facebook_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-normal hover:underline"
                                            title="Test link"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            {i18n.language === "ar" ? "فتح" : "Open"}
                                        </a>
                                    )}
                                </label>
                                <input
                                    type="url"
                                    value={settings.facebook_url}
                                    onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                    placeholder="https://www.facebook.com/..."
                                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                                    dir="ltr"
                                />
                            </div>

                            {/* TikTok */}
                            <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-gray-400 transition-colors">
                                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gray-900 text-white">
                                            <TikTokIcon className="w-4 h-4" />
                                        </div>
                                        <span>{t("tiktokUrl") || "TikTok URL"}</span>
                                    </span>
                                    {settings.tiktok_url && (
                                        <a
                                            href={settings.tiktok_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-800 hover:text-black text-xs flex items-center gap-1 font-normal hover:underline"
                                            title="Test link"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            {i18n.language === "ar" ? "فتح" : "Open"}
                                        </a>
                                    )}
                                </label>
                                <input
                                    type="url"
                                    value={settings.tiktok_url}
                                    onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                                    placeholder="https://www.tiktok.com/..."
                                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all font-mono"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Live Hero Preview Box */}
                        <div className="rounded-2xl p-6 bg-gradient-to-b from-[#FAF7F2] to-[#F3EDE2] border border-[#E8DFC8] text-center shadow-inner relative overflow-hidden">
                            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-900/70 mb-4">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                <span>{t("socialButtonsPreview") || "Home Hero Preview"}</span>
                            </div>

                            {/* Simulated Buttons */}
                            <div className="space-y-4 max-w-md mx-auto py-2">
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 opacity-60 pointer-events-none">
                                    <div className="bg-primary-900 text-white text-xs font-semibold px-6 py-2.5 rounded-full shadow">
                                        Shop now
                                    </div>
                                    <div className="bg-white text-primary-900 text-xs font-semibold px-6 py-2.5 rounded-full border border-gray-200 shadow-sm">
                                        Learn More
                                    </div>
                                </div>

                                {settings.show_social_media ? (
                                    <div className="pt-2 border-t border-primary-900/10">
                                        <p className="text-xs text-primary-900/60 mb-3">
                                            {i18n.language === "ar" ? "أزرار التواصل كما ستظهر للزوار:" : "Social buttons as seen by visitors:"}
                                        </p>
                                        <div className="flex flex-wrap justify-center items-center gap-3">
                                            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-white font-medium text-xs shadow-md bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] min-w-[130px]">
                                                <Instagram className="w-3.5 h-3.5" />
                                                <span>Instagram</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-white font-medium text-xs shadow-md bg-[#1877F2] min-w-[130px]">
                                                <Facebook className="w-3.5 h-3.5" />
                                                <span>Facebook</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full text-white font-medium text-xs shadow-md bg-black min-w-[130px]">
                                                <TikTokIcon className="w-3.5 h-3.5 fill-current" />
                                                <span>TikTok</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl bg-white/60 border border-gray-200 text-gray-500 text-xs flex items-center justify-center gap-2">
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {i18n.language === "ar"
                                                ? "أزرار السوشيال ميديا معطلة ولن تظهر في الصفحة الرئيسية"
                                                : "Social media buttons are disabled and will not appear on the home page"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 bg-primary-900 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-primary-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isSaving ? (i18n.language === "ar" ? "جاري الحفظ..." : "Saving...") : (t("save") || "Save Settings")}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
