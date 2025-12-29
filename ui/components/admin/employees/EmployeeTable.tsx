"use client";

import { useState } from "react";
import { Pencil, Trash2, Shield, User, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { EmployeePermissions, PERMISSION_MODULES } from "@/domain/entities/auth/permissions";
import PermissionsEditor from "./PermissionsEditor";

interface EmployeeTableProps {
    employees: MemberView[];
    onEdit: (employee: MemberView) => void;
    onDelete: (employee: MemberView) => void;
    onUpdatePermissions: (memberId: number, permissions: EmployeePermissions) => Promise<void>;
    onUpdateRole: (memberId: number, role: MemberRole) => Promise<void>;
    currentUserId?: number;
    lang: string;
}

export default function EmployeeTable({
    employees,
    onEdit,
    onDelete,
    onUpdatePermissions,
    onUpdateRole,
    currentUserId,
    lang,
}: EmployeeTableProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [localPermissions, setLocalPermissions] = useState<Record<number, EmployeePermissions>>({});

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800";
            case "moderator":
                return "bg-blue-100 text-blue-800";
            case "user":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getRoleIcon = (role: string) => {
        return role === "admin" ? Shield : User;
    };

    const getPermissionSummary = (permissions?: EmployeePermissions): string => {
        if (!permissions) return "No permissions set";

        const enabledModules = PERMISSION_MODULES.filter(m => permissions[m]?.view);
        if (enabledModules.length === 0) return "No access";
        if (enabledModules.length === PERMISSION_MODULES.length) return "Full access";
        if (enabledModules.length <= 3) return enabledModules.join(", ");
        return `${enabledModules.length} modules`;
    };

    const handleToggleExpand = (id: number) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            // Initialize local permissions if not set
            const employee = employees.find(e => e.id === id);
            if (employee && !localPermissions[id]) {
                setLocalPermissions(prev => ({
                    ...prev,
                    [id]: employee.permissions || {},
                }));
            }
        }
    };

    const handlePermissionsChange = (id: number, permissions: EmployeePermissions) => {
        setLocalPermissions(prev => ({
            ...prev,
            [id]: permissions,
        }));
    };

    const handleSavePermissions = async (employee: MemberView) => {
        const permissions = localPermissions[employee.id];
        if (!permissions) return;

        setSavingId(employee.id);
        try {
            await onUpdatePermissions(employee.id, permissions);
            setExpandedId(null);
        } catch (error) {
            console.error("Failed to save permissions:", error);
        } finally {
            setSavingId(null);
        }
    };

    const handleRoleChange = async (employee: MemberView, newRole: MemberRole) => {
        setSavingId(employee.id);
        try {
            await onUpdateRole(employee.id, newRole);
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setSavingId(null);
        }
    };

    if (employees.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No employees</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by adding your first team member.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permissions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Added
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => {
                            const RoleIcon = getRoleIcon(employee.role);
                            const isExpanded = expandedId === employee.id;
                            const isSaving = savingId === employee.id;
                            const isCurrentUser = currentUserId === employee.customer_id;
                            const currentPermissions = localPermissions[employee.id] || employee.permissions || {};

                            return (
                                <>
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <RoleIcon className="h-5 w-5 text-primary-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                        {employee.name || "Unknown User"}
                                                        {isCurrentUser && (
                                                            <span className="text-xs text-gray-400">(You)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {employee.email || "No email"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isCurrentUser ? (
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(employee.role)}`}>
                                                    {employee.role}
                                                </span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={employee.role}
                                                    onChange={(e) => handleRoleChange(employee, e.target.value as MemberRole)}
                                                    disabled={isSaving}
                                                    list={`role-suggestions-${employee.id}`}
                                                    className={`text-xs font-semibold rounded-full px-2 py-1 border border-gray-200 cursor-pointer ${getRoleBadgeColor(employee.role)} disabled:opacity-50 w-24`}
                                                />
                                            )}
                                            <datalist id={`role-suggestions-${employee.id}`}>
                                                <option value="admin" />
                                                <option value="moderator" />
                                                <option value="user" />
                                                <option value="manager" />
                                                <option value="accountant" />
                                                <option value="support" />
                                            </datalist>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleExpand(employee.id)}
                                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                                            >
                                                <span>{getPermissionSummary(employee.permissions)}</span>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(employee.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onEdit(employee)}
                                                    className="text-primary-600 hover:text-primary-900 p-1"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {!isCurrentUser && (
                                                    <button
                                                        onClick={() => onDelete(employee)}
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr key={`${employee.id}-permissions`}>
                                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                                                <div className="space-y-4">
                                                    <PermissionsEditor
                                                        permissions={currentPermissions}
                                                        onChange={(perms) => handlePermissionsChange(employee.id, perms)}
                                                        disabled={isSaving}
                                                    />
                                                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                                                        <button
                                                            onClick={() => setExpandedId(null)}
                                                            className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                                            disabled={isSaving}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleSavePermissions(employee)}
                                                            className="px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center gap-1 disabled:opacity-50"
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                                            Save Permissions
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
