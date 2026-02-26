// Staff Permission Constants & Helpers

export interface PermissionChild {
    key: string;
    label: string;
    labelAr: string;
    route: string;
}

export interface StaffPermission {
    key: string;
    label: string;
    labelAr: string;
    routes: string[];
    children?: PermissionChild[];
}

export const STAFF_PERMISSIONS: StaffPermission[] = [
    { key: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', routes: ['/admin'] },
    { key: 'customers', label: 'Customers', labelAr: 'العملاء', routes: ['/admin/customers'] },
    { key: 'materials', label: 'Materials', labelAr: 'المواد الخام', routes: ['/admin/materials'] },
    {
        key: 'products', label: 'Products', labelAr: 'المنتجات', routes: ['/admin/products'],
        children: [
            { key: 'products.all', label: 'All Products', labelAr: 'كل المنتجات', route: '/admin/products' },
            { key: 'products.packaging', label: 'Packaging Rules', labelAr: 'قواعد التغليف', route: '/admin/products/packaging-rules' },
            { key: 'products.categories', label: 'Categories', labelAr: 'التصنيفات', route: '/admin/products/categories' },
            { key: 'products.reviews', label: 'Reviews', labelAr: 'التقييمات', route: '/admin/products/reviews' },
        ]
    },
    {
        key: 'orders', label: 'Orders', labelAr: 'الطلبات', routes: ['/admin/orders'],
        children: [
            { key: 'orders.all', label: 'All Orders', labelAr: 'كل الطلبات', route: '/admin/orders' },
            { key: 'orders.packing', label: 'Order Packing', labelAr: 'تجهيز الطلبات', route: '/admin/orders/packing' },
            { key: 'orders.create', label: 'Create Order', labelAr: 'إنشاء طلب', route: '/admin/orders/create' },
        ]
    },
    { key: 'promo_codes', label: 'Promo Codes', labelAr: 'أكواد الخصم', routes: ['/admin/promo-codes'] },
    {
        key: 'shipping', label: 'Shipping', labelAr: 'الشحن', routes: ['/admin/shipping'],
        children: [
            { key: 'shipping.dashboard', label: 'Shipping Dashboard', labelAr: 'لوحة الشحن', route: '/admin/shipping' },
            { key: 'shipping.history', label: 'History', labelAr: 'السجل', route: '/admin/shipping/history' },
            { key: 'shipping.governorates', label: 'Governorates', labelAr: 'المحافظات', route: '/admin/shipping/governorates' },
        ]
    },
    {
        key: 'reports', label: 'Reports & Analytics', labelAr: 'التقارير والتحليلات', routes: ['/admin/reports', '/admin/analytics'],
        children: [
            { key: 'reports.reports', label: 'Reports', labelAr: 'التقارير', route: '/admin/reports' },
            { key: 'reports.analytics', label: 'Analytics', labelAr: 'التحليلات', route: '/admin/analytics' },
        ]
    },
    {
        key: 'finance', label: 'Finance', labelAr: 'المالية', routes: ['/admin/finance'],
        children: [
            { key: 'finance.business', label: 'Business Analysis', labelAr: 'تحليل الأعمال', route: '/admin/finance/business-analysis' },
            { key: 'finance.cashflow', label: 'Cashflow', labelAr: 'التدفق النقدي', route: '/admin/finance/cashflow' },
            { key: 'finance.categories', label: 'Categories', labelAr: 'التصنيفات', route: '/admin/finance/cashflow-categories' },
        ]
    },
    { key: 'wishlists', label: 'Wishlists', labelAr: 'قوائم الأمنيات', routes: ['/admin/wishlists'] },
    { key: 'gallery', label: 'Gallery', labelAr: 'المعرض', routes: ['/admin/gallery'] },
    { key: 'themes', label: 'Themes', labelAr: 'الثيمات', routes: ['/admin/themes'] },
    { key: 'team_members', label: 'Team Members', labelAr: 'فريق العمل', routes: ['/admin/people'] },
] as const;

export type StaffPermissionKey = string;

/**
 * Check if a staff member has access to a given admin route.
 * Supports both parent-level permissions (e.g., 'orders' = all sub-pages)
 * and child-level permissions (e.g., 'orders.packing' = only packing page)
 */
export function hasPermissionForRoute(permissions: string[], pathname: string): boolean {
    const adminMatch = pathname.match(/\/admin(\/.*)?$/);
    if (!adminMatch) return false;

    const adminPath = '/admin' + (adminMatch[1] || '');

    for (const perm of STAFF_PERMISSIONS) {
        // Check child-level permissions first
        if (perm.children) {
            for (const child of perm.children) {
                if (permissions.includes(child.key)) {
                    if (adminPath === child.route || adminPath.startsWith(child.route + '/')) {
                        return true;
                    }
                }
            }
        }

        // Check parent-level permission (grants access to ALL sub-pages)
        if (permissions.includes(perm.key)) {
            for (const route of perm.routes) {
                if (adminPath === route || adminPath.startsWith(route + '/')) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Get the first allowed admin route for a staff member
 */
export function getFirstAllowedRoute(permissions: string[]): string {
    for (const perm of STAFF_PERMISSIONS) {
        if (permissions.includes(perm.key)) {
            return perm.routes[0];
        }
        // Check child-level
        if (perm.children) {
            for (const child of perm.children) {
                if (permissions.includes(child.key)) {
                    return child.route;
                }
            }
        }
    }
    return '/';
}

/**
 * Check if a staff member has access to a specific navigation item (parent-level)
 */
export function hasParentPermission(permissions: string[], parentKey: string): boolean {
    // Direct parent permission
    if (permissions.includes(parentKey)) return true;
    // Any child of this parent
    const perm = STAFF_PERMISSIONS.find(p => p.key === parentKey);
    if (perm?.children) {
        return perm.children.some(c => permissions.includes(c.key));
    }
    return false;
}

/**
 * Check if a staff member has access to a submenu item
 */
export function hasSubmenuPermission(permissions: string[], parentKey: string, submenuHref: string): boolean {
    // If parent-level permission is granted, all sub-pages are accessible
    if (permissions.includes(parentKey)) return true;
    // Check child-level
    const perm = STAFF_PERMISSIONS.find(p => p.key === parentKey);
    if (perm?.children) {
        const child = perm.children.find(c => c.route === submenuHref);
        if (child && permissions.includes(child.key)) return true;
    }
    return false;
}

export function getPermissionKeys(): string[] {
    return STAFF_PERMISSIONS.map(p => p.key);
}
