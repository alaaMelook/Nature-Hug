import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/domain/entities/database/settings";

export class AdminSettingsUseCase {
    async getSettings(): Promise<StoreSettings> {
        try {
            const { data, error } = await supabaseAdmin
                .from('settings')
                .select('key, value');

            if (error || !data) {
                console.error("[AdminSettingsUseCase] Error fetching settings:", error);
                return DEFAULT_STORE_SETTINGS;
            }

            const settingsMap: Record<string, string> = {};
            for (const item of data) {
                if (item.key && item.value !== undefined && item.value !== null) {
                    settingsMap[item.key] = item.value;
                }
            }

            return {
                show_social_media: settingsMap.show_social_media !== undefined 
                    ? settingsMap.show_social_media === 'true' 
                    : DEFAULT_STORE_SETTINGS.show_social_media,
                facebook_url: settingsMap.facebook_url || DEFAULT_STORE_SETTINGS.facebook_url,
                instagram_url: settingsMap.instagram_url || DEFAULT_STORE_SETTINGS.instagram_url,
                tiktok_url: settingsMap.tiktok_url || DEFAULT_STORE_SETTINGS.tiktok_url,
            };
        } catch (error) {
            console.error("[AdminSettingsUseCase] Unexpected error in getSettings:", error);
            return DEFAULT_STORE_SETTINGS;
        }
    }

    async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
        try {
            const entriesToUpdate: { key: string; value: string }[] = [];

            if (settings.show_social_media !== undefined) {
                entriesToUpdate.push({
                    key: 'show_social_media',
                    value: String(settings.show_social_media)
                });
            }

            if (settings.facebook_url !== undefined) {
                entriesToUpdate.push({
                    key: 'facebook_url',
                    value: settings.facebook_url
                });
            }

            if (settings.instagram_url !== undefined) {
                entriesToUpdate.push({
                    key: 'instagram_url',
                    value: settings.instagram_url
                });
            }

            if (settings.tiktok_url !== undefined) {
                entriesToUpdate.push({
                    key: 'tiktok_url',
                    value: settings.tiktok_url
                });
            }

            for (const item of entriesToUpdate) {
                const { data: existing } = await supabaseAdmin
                    .from('settings')
                    .select('id')
                    .eq('key', item.key)
                    .maybeSingle();

                if (existing) {
                    await supabaseAdmin
                        .from('settings')
                        .update({ value: item.value })
                        .eq('key', item.key);
                } else {
                    await supabaseAdmin
                        .from('settings')
                        .insert({ key: item.key, value: item.value });
                }
            }

            return await this.getSettings();
        } catch (error) {
            console.error("[AdminSettingsUseCase] Unexpected error in updateSettings:", error);
            throw error;
        }
    }
}
