import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { StoreSettings, DEFAULT_STORE_SETTINGS } from "@/domain/entities/database/settings";

export class GetStoreSettings {
    async execute(): Promise<StoreSettings> {
        try {
            const { data, error } = await supabaseAdmin
                .from('settings')
                .select('key, value');

            if (error || !data) {
                console.error("[GetStoreSettings] Error fetching settings:", error);
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
            console.error("[GetStoreSettings] Unexpected error:", error);
            return DEFAULT_STORE_SETTINGS;
        }
    }
}
