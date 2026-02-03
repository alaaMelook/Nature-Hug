import { Theme } from "@/domain/entities/database/theme";
import { createSupabaseServerClient } from "@/data/datasources/supabase/server";

export class ThemesRepository {

    async getAll(): Promise<Theme[]> {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .schema('store')
            .from('themes')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('[ThemesRepository] getAll error:', error);
            throw error;
        }
        return data || [];
    }

    async getActive(): Promise<Theme | null> {
        const supabase = await createSupabaseServerClient();
        const now = new Date().toISOString();

        // First try to get a scheduled active theme
        const { data: scheduledTheme, error: scheduledError } = await supabase
            .schema('store')
            .from('themes')
            .select('*')
            .eq('is_active', true)
            .lte('valid_from', now)
            .or(`valid_until.is.null,valid_until.gte.${now}`)
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (scheduledTheme && !scheduledError) {
            return scheduledTheme;
        }

        // Fallback to any active theme without schedule
        const { data: activeTheme, error } = await supabase
            .schema('store')
            .from('themes')
            .select('*')
            .eq('is_active', true)
            .is('valid_from', null)
            .order('id', { ascending: true })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('[ThemesRepository] getActive error:', error);
        }

        return activeTheme || null;
    }

    async getById(id: number): Promise<Theme | null> {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .schema('store')
            .from('themes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('[ThemesRepository] getById error:', error);
            throw error;
        }
        return data;
    }

    async create(theme: Omit<Theme, 'id' | 'created_at'>): Promise<Theme> {
        const supabase = await createSupabaseServerClient();

        // If this theme is being set as active, deactivate others first
        if (theme.is_active) {
            await this.deactivateAll();
        }

        const { data, error } = await supabase
            .schema('store')
            .from('themes')
            .insert(theme)
            .select()
            .single();

        if (error) {
            console.error('[ThemesRepository] create error:', error);
            throw error;
        }
        return data;
    }

    async update(id: number, theme: Partial<Theme>): Promise<Theme> {
        const supabase = await createSupabaseServerClient();

        // If this theme is being set as active, deactivate others first
        if (theme.is_active) {
            await this.deactivateAll();
        }

        const { data, error } = await supabase
            .schema('store')
            .from('themes')
            .update(theme)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[ThemesRepository] update error:', error);
            throw error;
        }
        return data;
    }

    async delete(id: number): Promise<void> {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .schema('store')
            .from('themes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[ThemesRepository] delete error:', error);
            throw error;
        }
    }

    async setActive(id: number): Promise<Theme> {
        // Deactivate all themes first
        await this.deactivateAll();

        // Then activate the selected one
        return this.update(id, { is_active: true });
    }

    private async deactivateAll(): Promise<void> {
        const supabase = await createSupabaseServerClient();
        await supabase
            .schema('store')
            .from('themes')
            .update({ is_active: false })
            .neq('id', 0);  // Update all
    }
}
