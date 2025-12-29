"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import {
    EmployeePermissions,
    ModulePermissions,
    PERMISSION_MODULES
} from "@/domain/entities/auth/permissions";

interface PermissionsEditorProps {
    permissions: EmployeePermissions;
    onChange: (permissions: EmployeePermissions) => void;
    disabled?: boolean;
    compact?: boolean;
}

const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;

// Module-specific actions that differ from standard CRUD
const MODULE_SPECIAL_ACTIONS: Record<string, string[]> = {
    dashboard: ['view'],
    gallery: ['view', 'upload', 'delete'],
    reviews: ['view', 'moderate', 'delete'],
    settings: ['view', 'edit'],
};

export default function PermissionsEditor({
    permissions,
    onChange,
    disabled = false,
    compact = false,
}: PermissionsEditorProps) {
    const getActionsForModule = (module: string): string[] => {
        return MODULE_SPECIAL_ACTIONS[module] || [...PERMISSION_ACTIONS];
    };

    const togglePermission = (module: keyof EmployeePermissions, action: string) => {
        if (disabled) return;

        const currentValue = permissions[module]?.[action as keyof ModulePermissions] ?? false;
        onChange({
            ...permissions,
            [module]: {
                ...permissions[module],
                [action]: !currentValue,
            },
        });
    };

    const toggleModuleAll = (module: keyof EmployeePermissions, enable: boolean) => {
        if (disabled) return;

        const actions = getActionsForModule(module);
        const newModulePerms: ModulePermissions = {};
        actions.forEach(action => {
            newModulePerms[action as keyof ModulePermissions] = enable;
        });

        onChange({
            ...permissions,
            [module]: newModulePerms,
        });
    };

    const setAllPermissions = (enable: boolean) => {
        if (disabled) return;

        const newPerms: EmployeePermissions = {};
        PERMISSION_MODULES.forEach(module => {
            const actions = getActionsForModule(module);
            const modulePerms: ModulePermissions = {};
            actions.forEach(action => {
                modulePerms[action as keyof ModulePermissions] = enable;
            });
            newPerms[module] = modulePerms;
        });

        onChange(newPerms);
    };

    const isModuleFullAccess = (module: keyof EmployeePermissions): boolean => {
        const actions = getActionsForModule(module);
        return actions.every(action => permissions[module]?.[action as keyof ModulePermissions] === true);
    };

    const isModuleNoAccess = (module: keyof EmployeePermissions): boolean => {
        const actions = getActionsForModule(module);
        return actions.every(action => !permissions[module]?.[action as keyof ModulePermissions]);
    };

    if (compact) {
        return (
            <div className="space-y-2">
                <div className="flex gap-2 mb-3">
                    <button
                        type="button"
                        onClick={() => setAllPermissions(true)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50"
                        disabled={disabled}
                    >
                        Grant All
                    </button>
                    <button
                        type="button"
                        onClick={() => setAllPermissions(false)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50"
                        disabled={disabled}
                    >
                        Revoke All
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PERMISSION_MODULES.map(module => (
                        <label
                            key={module}
                            className={`
                                flex items-center p-2 rounded border cursor-pointer transition-colors
                                ${permissions[module]?.view
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-gray-50 border-gray-200'}
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'}
                            `}
                        >
                            <input
                                type="checkbox"
                                checked={permissions[module]?.view ?? false}
                                onChange={() => togglePermission(module, 'view')}
                                disabled={disabled}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm capitalize">{module}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => setAllPermissions(true)}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                    disabled={disabled}
                >
                    Full Access
                </button>
                <button
                    type="button"
                    onClick={() => setAllPermissions(false)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                    disabled={disabled}
                >
                    No Access
                </button>
            </div>

            {/* Permissions Grid */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Module</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-600">View</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-600">Create</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-600">Edit</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-600">Delete</th>
                            <th className="text-center py-2 px-2 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {PERMISSION_MODULES.map(module => {
                            const actions = getActionsForModule(module);
                            const isFullAccess = isModuleFullAccess(module);
                            const isNoAccess = isModuleNoAccess(module);

                            return (
                                <tr key={module} className="hover:bg-gray-50">
                                    <td className="py-2 px-3 font-medium capitalize text-gray-700">
                                        {module}
                                    </td>
                                    {['view', 'create', 'edit', 'delete'].map(action => {
                                        const hasAction = actions.includes(action);
                                        const isChecked = hasAction && (permissions[module]?.[action as keyof ModulePermissions] ?? false);

                                        return (
                                            <td key={action} className="text-center py-2 px-2">
                                                {hasAction ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePermission(module, action)}
                                                        disabled={disabled}
                                                        className={`
                                                            w-6 h-6 rounded flex items-center justify-center transition-colors
                                                            ${isChecked
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-gray-200 text-gray-400'}
                                                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
                                                        `}
                                                    >
                                                        {isChecked ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="text-center py-2 px-2">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => toggleModuleAll(module, true)}
                                                disabled={disabled || isFullAccess}
                                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                                                title="Grant all"
                                            >
                                                All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleModuleAll(module, false)}
                                                disabled={disabled || isNoAccess}
                                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                                                title="Revoke all"
                                            >
                                                None
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
