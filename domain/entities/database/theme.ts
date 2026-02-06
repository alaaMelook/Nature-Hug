// Individual decoration item with its own settings
export interface DecorationItem {
    id: string;
    url: string;
    mode: 'animated' | 'static';
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'corners';
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    rotation?: number;
    flip_horizontal?: boolean;
    flip_vertical?: boolean;
}

export interface Theme {
    id: number;
    name: string;
    name_ar?: string;
    is_active: boolean;

    // Decorations - built-in animations
    decoration_types?: string[];  // Multiple types e.g. ['hearts', 'lanterns']
    decoration_color?: string;  // Color of the built-in decorations

    // Custom decorations - multiple images with individual settings
    custom_decorations?: DecorationItem[];

    // Legacy fields (kept for backward compatibility)
    decoration_type?: string | null;
    custom_decoration_url?: string;
    decoration_mode?: 'animated' | 'static';
    static_position?: string;
    image_size?: 'small' | 'medium' | 'large' | 'xlarge';
    image_rotation?: number;
    flip_horizontal?: boolean;
    flip_vertical?: boolean;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;

    // Product ribbon/badge
    product_ribbon_text?: string;
    product_ribbon_text_ar?: string;
    product_ribbon_color?: string;

    // Banner (optional)
    banner_image_url?: string;
    banner_text?: string;
    banner_text_ar?: string;

    // Announcement Bar - shows below navbar
    show_announcement?: boolean;
    announcement_text?: string;
    announcement_text_ar?: string;
    announcement_bg_color?: string;
    announcement_text_color?: string;
    announcement_countdown_end?: string;  // ISO datetime - bar hides when countdown ends
    announcement_scroll_speed?: 'slow' | 'medium' | 'fast';  // Scroll speed

    // Scheduling (Optional)
    valid_from?: string;
    valid_until?: string;

    created_at?: string;
}

// Default themes to seed
export const DEFAULT_THEMES: Omit<Theme, 'id' | 'created_at'>[] = [
    {
        name: 'Default',
        name_ar: 'افتراضي',
        is_active: true,
        primary_color: '#66BB6A',
        secondary_color: '#4CAF50',
        accent_color: '#81C784',
        decoration_type: null,
    },
    {
        name: "Valentine's Day",
        name_ar: 'عيد الحب',
        is_active: false,
        primary_color: '#E91E63',  // Pink/Red
        secondary_color: '#F44336',
        accent_color: '#FF4081',
        decoration_type: 'hearts',
        decoration_color: '#FF1744',
        product_ribbon_text: '❤️ Valentine Special',
        product_ribbon_text_ar: '❤️ عرض عيد الحب',
        product_ribbon_color: '#E91E63',
    },
    {
        name: 'Ramadan',
        name_ar: 'رمضان',
        is_active: false,
        primary_color: '#66BB6A',  // Keep green
        secondary_color: '#4CAF50',
        accent_color: '#81C784',
        decoration_type: 'lanterns',
        decoration_color: '#FFD700',  // Gold lanterns
        product_ribbon_text: '🌙 Ramadan Offer',
        product_ribbon_text_ar: '🌙 عرض رمضان',
        product_ribbon_color: '#9C27B0',
    },
    {
        name: 'Eid',
        name_ar: 'العيد',
        is_active: false,
        primary_color: '#66BB6A',  // Keep green
        secondary_color: '#4CAF50',
        accent_color: '#81C784',
        decoration_type: 'balloons',
        decoration_color: '#FFD700',  // Gold/colorful balloons
        product_ribbon_text: '🎉 Eid Sale',
        product_ribbon_text_ar: '🎉 عرض العيد',
        product_ribbon_color: '#FF9800',
    },
];
