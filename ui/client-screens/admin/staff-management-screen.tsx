"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, UserPlus, Shield, User, Loader2, X, Check, Trash2, Edit3, Mail, Lock, UserCheck
} from "lucide-react";
import { STAFF_PERMISSIONS } from "@/lib/permissions";

interface StaffMember {
    id: number;
    user_id: number;
    role: string;
    created_at: string;
    permissions: string[];
    customers: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
}

interface CustomerResult {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

type ModalMode = null | 'add' | 'edit';
type CreateTab = 'new' | 'existing';

export default function StaffManagementScreen() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Create form state
    const [createTab, setCreateTab] = useState<CreateTab>('new');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newName, setNewName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    // Search existing customer
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CustomerResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResult | null>(null);

    const fetchStaff = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/staff');
            const data = await res.json();
            if (data.success) setStaff(data.data || []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    // Search customers
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await fetch(`/api/admin/staff/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (data.success) setSearchResults(data.data || []);
            } catch (e) {
                console.error('Search error:', e);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev => {
            if (prev.includes(key)) {
                // Removing a parent? Also remove all its children
                const perm = STAFF_PERMISSIONS.find(p => p.key === key);
                const childKeys = perm?.children?.map(c => c.key) || [];
                return prev.filter(p => p !== key && !childKeys.includes(p));
            } else {
                // Adding a parent? Also add all its children
                const perm = STAFF_PERMISSIONS.find(p => p.key === key);
                const childKeys = perm?.children?.map(c => c.key) || [];
                return [...new Set([...prev, key, ...childKeys])];
            }
        });
    };

    const toggleChildPermission = (parentKey: string, childKey: string) => {
        setSelectedPermissions(prev => {
            let next;
            if (prev.includes(childKey)) {
                // Remove child, and also remove parent if present
                next = prev.filter(p => p !== childKey && p !== parentKey);
            } else {
                next = [...prev, childKey];
            }
            return next;
        });
    };

    const selectAll = () => {
        const allKeys: string[] = [];
        STAFF_PERMISSIONS.forEach(p => {
            allKeys.push(p.key);
            p.children?.forEach(c => allKeys.push(c.key));
        });
        setSelectedPermissions(allKeys);
    };

    const deselectAll = () => {
        setSelectedPermissions([]);
    };

    const resetForm = () => {
        setNewEmail('');
        setNewPassword('');
        setNewName('');
        setSelectedPermissions([]);
        setSearchQuery('');
        setSearchResults([]);
        setSelectedCustomer(null);
        setCreateTab('new');
        setEditingStaff(null);
    };

    const handleAdd = () => {
        resetForm();
        setModalMode('add');
    };

    const handleEdit = (member: StaffMember) => {
        setEditingStaff(member);
        setSelectedPermissions(member.permissions || []);
        setNewName(member.customers?.name || '');
        setModalMode('edit');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (modalMode === 'add') {
                const body: any = { permissions: selectedPermissions };
                if (createTab === 'new') {
                    body.mode = 'new';
                    body.email = newEmail;
                    body.password = newPassword;
                    body.name = newName;
                } else {
                    if (!selectedCustomer) return;
                    body.mode = 'existing';
                    body.customerId = selectedCustomer.id;
                }
                const res = await fetch('/api/admin/staff', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
            } else if (modalMode === 'edit' && editingStaff) {
                const res = await fetch(`/api/admin/staff/${editingStaff.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        permissions: selectedPermissions,
                        name: newName,
                        customerId: editingStaff.customers?.id || editingStaff.user_id,
                    }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
            }
            setModalMode(null);
            resetForm();
            setLoading(true);
            await fetchStaff();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (member: StaffMember) => {
        if (!confirm(`Are you sure you want to remove "${member.customers?.name}" from staff?`)) return;
        setDeleting(member.user_id);
        try {
            const res = await fetch(`/api/admin/staff/${member.user_id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await fetchStaff();
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Staff Management</h2>
                    <p className="text-gray-600">إدارة الموظفين وصلاحياتهم</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff Member
                </button>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {staff.length === 0 ? (
                    <div className="text-center py-16">
                        <Shield className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-3 text-sm font-medium text-gray-900">No staff members</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first staff member.</p>
                        <button
                            onClick={handleAdd}
                            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Staff Member
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {staff.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                                        <span className="text-white font-bold text-sm">
                                                            {(member.customers?.name || '?')[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{member.customers?.name || 'Unknown'}</div>
                                                    <div className="text-sm text-gray-500">{member.customers?.email || 'No email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-sm">
                                                {(member.permissions || []).map(p => {
                                                    // Find label from parent or child
                                                    let label = p;
                                                    for (const sp of STAFF_PERMISSIONS) {
                                                        if (sp.key === p) { label = sp.label; break; }
                                                        const child = sp.children?.find(c => c.key === p);
                                                        if (child) { label = child.label; break; }
                                                    }
                                                    return (
                                                        <span
                                                            key={p}
                                                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${p.includes('.') ? 'bg-blue-50 text-blue-700' : 'bg-primary-50 text-primary-700'
                                                                }`}
                                                        >
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                                {(!member.permissions || member.permissions.length === 0) && (
                                                    <span className="text-xs text-gray-400">No permissions</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => handleEdit(member)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                                            >
                                                <Edit3 className="h-3.5 w-3.5 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member)}
                                                disabled={deleting === member.user_id}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                {deleting === member.user_id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                        Remove
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalMode && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {modalMode === 'add' ? '➕ Add Staff Member' : '✏️ Edit Permissions'}
                            </h3>
                            <button
                                onClick={() => { setModalMode(null); resetForm(); }}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Add Mode: Tab selector */}
                            {modalMode === 'add' && (
                                <>
                                    <div className="flex rounded-lg bg-gray-100 p-1">
                                        <button
                                            onClick={() => { setCreateTab('new'); setSelectedCustomer(null); }}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${createTab === 'new'
                                                ? 'bg-white text-primary-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Create New Account
                                        </button>
                                        <button
                                            onClick={() => setCreateTab('existing')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${createTab === 'existing'
                                                ? 'bg-white text-primary-700 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <UserCheck className="h-4 w-4" />
                                            Existing Customer
                                        </button>
                                    </div>

                                    {/* New Account Form */}
                                    {createTab === 'new' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={newName}
                                                        onChange={e => setNewName(e.target.value)}
                                                        placeholder="Staff member name"
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={newEmail}
                                                        onChange={e => setNewEmail(e.target.value)}
                                                        placeholder="staff@example.com"
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        placeholder="Min 6 characters"
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Existing Customer Search */}
                                    {createTab === 'existing' && (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={e => { setSearchQuery(e.target.value); setSelectedCustomer(null); }}
                                                    placeholder="Search by name, email, or phone..."
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                                />
                                                {searchLoading && (
                                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                                )}
                                            </div>

                                            {/* Selected Customer */}
                                            {selectedCustomer && (
                                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <Check className="h-5 w-5 text-green-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
                                                        <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedCustomer(null)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Search Results */}
                                            {!selectedCustomer && searchResults.length > 0 && (
                                                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                                    {searchResults.map(c => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => { setSelectedCustomer(c); setSearchResults([]); }}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                                                        >
                                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{c.name || 'No name'}</p>
                                                                <p className="text-xs text-gray-500">{c.email} {c.phone ? `• ${c.phone}` : ''}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Edit Mode: show member info */}
                            {modalMode === 'edit' && editingStaff && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {(newName || editingStaff.customers?.name || '?')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">{editingStaff.customers?.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={e => setNewName(e.target.value)}
                                                placeholder="Staff member name"
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Permissions Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        🔒 Permissions
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={selectAll}
                                            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={deselectAll}
                                            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {STAFF_PERMISSIONS.map(perm => {
                                        const hasChildren = perm.children && perm.children.length > 0;
                                        const isParentChecked = selectedPermissions.includes(perm.key);
                                        const someChildrenChecked = hasChildren && perm.children!.some(c => selectedPermissions.includes(c.key));

                                        return (
                                            <div key={perm.key} className={`rounded-lg border transition-all ${isParentChecked || someChildrenChecked
                                                ? 'border-primary-300 bg-primary-50/50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}>
                                                {/* Parent Permission */}
                                                <label className="flex items-center gap-3 p-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={isParentChecked}
                                                        onChange={() => togglePermission(perm.key)}
                                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{perm.label}</p>
                                                        <p className="text-xs text-gray-500">{perm.labelAr}</p>
                                                    </div>
                                                    {hasChildren && isParentChecked && (
                                                        <span className="text-xs text-primary-600 font-medium">All sub-pages ✓</span>
                                                    )}
                                                </label>

                                                {/* Children - only show if parent is NOT fully checked */}
                                                {hasChildren && !isParentChecked && (
                                                    <div className="border-t border-gray-100 px-3 pb-3 pt-2 ml-7 space-y-1.5">
                                                        <p className="text-xs text-gray-400 mb-1">Sub-pages:</p>
                                                        {perm.children!.map(child => (
                                                            <label key={child.key} className="flex items-center gap-2 cursor-pointer py-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedPermissions.includes(child.key)}
                                                                    onChange={() => toggleChildPermission(perm.key, child.key)}
                                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700">{child.label}</span>
                                                                <span className="text-xs text-gray-400">({child.labelAr})</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => { setModalMode(null); resetForm(); }}
                                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || (modalMode === 'add' && createTab === 'new' && (!newEmail || !newPassword)) || (modalMode === 'add' && createTab === 'existing' && !selectedCustomer) || selectedPermissions.length === 0}
                                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        {modalMode === 'add' ? 'Add Staff Member' : 'Save Changes'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
