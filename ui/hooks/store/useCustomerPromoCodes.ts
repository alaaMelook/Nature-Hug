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
    // Try with string ID first (the column stores IDs as strings in some cases)
    // Then fallback to number if that fails
    let data: any = null;
    let error: any = null;

    // First try with string ID
    const result1 = await supabaseAdmin
        .schema('store')
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .contains('eligible_customer_ids', [String(customerId)]);
    
    if (!result1.error) {
        data = result1.data;
    } else {
        // Fallback: try with number ID
        const result2 = await supabaseAdmin
            .schema('store')
            .from('promo_codes')
            .select('*')
            .eq('is_active', true)
            .contains('eligible_customer_ids', [customerId]);
        
        data = result2.data;
        error = result2.error;
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


