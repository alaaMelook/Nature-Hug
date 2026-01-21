'use server'

import { supabaseAdmin } from "@/data/datasources/supabase/admin";
import { PromoCode } from "@/domain/entities/database/promoCode";

export async function getCustomerPromoCodes(customerId: number): Promise<PromoCode[]> {
    console.log("[getCustomerPromoCodes] Fetching promo codes for customer:", customerId);

    const now = new Date().toISOString();

    // Get promo codes where:
    // 1. is_active = true
    // 2. eligible_customer_ids contains this customer's ID
    // 3. valid_until is null OR in the future
    // 4. valid_from is null OR in the past
    const { data, error } = await supabaseAdmin
        .schema('store')
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .contains('eligible_customer_ids', [customerId]);

    console.log("[getCustomerPromoCodes] Raw query result:", { data, error, customerId });

    if (error) {
        console.error('Error fetching customer promo codes:', error);
        return [];
    }

    // Filter by date validity in code (since Supabase OR logic with nulls is complex)
    const validCodes = (data || []).filter((code: PromoCode) => {
        // Check valid_from
        if (code.valid_from && new Date(code.valid_from) > new Date()) {
            console.log("[getCustomerPromoCodes] Code not active yet:", code.code, code.valid_from);
            return false; // Not active yet
        }
        // Check valid_until
        if (code.valid_until && new Date(code.valid_until) < new Date()) {
            console.log("[getCustomerPromoCodes] Code expired:", code.code, code.valid_until);
            return false; // Already expired
        }
        return true;
    });

    console.log("[getCustomerPromoCodes] Valid codes after filtering:", validCodes.length);
    return validCodes;
}


