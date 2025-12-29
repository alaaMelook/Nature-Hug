// Permission types for granular access control

export interface ModulePermissions {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    // Special permissions for specific modules
    upload?: boolean;    // for gallery
    moderate?: boolean;  // for reviews
}

export interface EmployeePermissions {
    dashboard?: ModulePermissions;
    orders?: ModulePermissions;
    products?: ModulePermissions;
    materials?: ModulePermissions;
    customers?: ModulePermissions;
    shipping?: ModulePermissions;
    gallery?: ModulePermissions;
    promoCodes?: ModulePermissions;
    reviews?: ModulePermissions;
    employees?: ModulePermissions;
    settings?: ModulePermissions;
}

// Permission modules list for UI iteration
export const PERMISSION_MODULES = [
    'dashboard',
    'orders',
    'products',
    'materials',
    'customers',
    'shipping',
    'gallery',
    'promoCodes',
    'reviews',
    'employees',
    'settings'
] as const;

export type PermissionModule = typeof PERMISSION_MODULES[number];

// Default permissions for admin - full access
export const ADMIN_PERMISSIONS: EmployeePermissions = {
    dashboard: { view: true },
    orders: { view: true, create: true, edit: true, delete: true },
    products: { view: true, create: true, edit: true, delete: true },
    materials: { view: true, create: true, edit: true, delete: true },
    customers: { view: true, create: true, edit: true, delete: true },
    shipping: { view: true, create: true, edit: true, delete: true },
    gallery: { view: true, upload: true, delete: true },
    promoCodes: { view: true, create: true, edit: true, delete: true },
    reviews: { view: true, moderate: true, delete: true },
    employees: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, edit: true }
};

// Default permissions for moderator - limited access
export const MODERATOR_PERMISSIONS: EmployeePermissions = {
    dashboard: { view: false },
    orders: { view: false },
    products: { view: false },
    materials: { view: false },
    customers: { view: false },
    shipping: { view: true, edit: true },
    gallery: { view: false },
    promoCodes: { view: false },
    reviews: { view: false },
    employees: { view: false },
    settings: { view: false }
};

// Default permissions for new employee - view only
export const DEFAULT_EMPLOYEE_PERMISSIONS: EmployeePermissions = {
    dashboard: { view: true },
    orders: { view: true },
    products: { view: true },
    materials: { view: true },
    customers: { view: true },
    shipping: { view: true },
    gallery: { view: true },
    promoCodes: { view: true },
    reviews: { view: true },
    employees: { view: false },
    settings: { view: false }
};

// Helper to check if a user has a specific permission
export function hasPermission(
    permissions: EmployeePermissions | undefined,
    module: PermissionModule,
    action: keyof ModulePermissions
): boolean {
    if (!permissions) return false;
    const modulePerms = permissions[module];
    if (!modulePerms) return false;
    return !!modulePerms[action];
}

// Helper to merge permissions with defaults
export function mergeWithDefaults(
    permissions: Partial<EmployeePermissions> | undefined,
    defaults: EmployeePermissions = DEFAULT_EMPLOYEE_PERMISSIONS
): EmployeePermissions {
    if (!permissions) return defaults;
    return {
        ...defaults,
        ...permissions
    };
}
