// admin.packaging_rules table
// Defines how packaging materials are deducted when orders are processed

export interface PackagingRule {
    id: number;
    material_id: number;
    material_name?: string;     // joined from materials table
    deduction_type: 'per_order' | 'per_item';
    applies_to: 'all' | 'specific';
    product_ids?: number[];      // from packaging_rule_products junction
    product_names?: string[];    // joined product names for display
    quantity_single: number;     // qty to deduct when order has 1 item
    quantity_multiple: number;   // qty to deduct when order has >1 items
    is_active: boolean;
    created_at?: string;
}

export interface OrderMaterialDeduction {
    id: number;
    order_id: number;
    material_id: number;
    material_name?: string;
    quantity_deducted: number;
    created_at?: string;
}
