"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, UserPlus, Shield, RefreshCcw, Loader2 } from "lucide-react";
import { MemberView } from "@/domain/entities/views/admin/memberView";
import { EmployeePermissions } from "@/domain/entities/auth/permissions";
import CreateEmployeeModal from "@/ui/components/admin/employees/CreateEmployeeModal";
import EmployeeTable from "@/ui/components/admin/employees/EmployeeTable";

export default function EmployeesScreen({ currentUserId }: { currentUserId?: number }) {
    const params = useParams();
    const lang = (params?.lang as string) || "en";

    const [employees, setEmployees] = useState<MemberView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<MemberView | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/${lang}/admin/employees/api`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to fetch employees");
            }

            setEmployees(result.data || []);
        } catch (err: any) {
            console.error("Fetch employees error:", err);
            setError(err.message || "Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [lang]);

    const handleUpdatePermissions = async (memberId: number, permissions: EmployeePermissions) => {
        const response = await fetch(`/${lang}/admin/employees/api/${memberId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permissions }),
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || "Failed to update permissions");
        }

        // Update local state
        setEmployees(prev => prev.map(emp =>
            emp.id === memberId ? { ...emp, permissions } : emp
        ));
    };

    const handleUpdateRole = async (memberId: number, role: MemberRole) => {
        const response = await fetch(`/${lang}/admin/employees/api/${memberId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role }),
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || "Failed to update role");
        }

        // Update local state
        setEmployees(prev => prev.map(emp =>
            emp.id === memberId ? { ...emp, role } : emp
        ));
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            const response = await fetch(`/${lang}/admin/employees/api/${deleteConfirm.id}`, {
                method: "DELETE",
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to delete employee");
            }

            // Remove from local state
            setEmployees(prev => prev.filter(emp => emp.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (err: any) {
            console.error("Delete employee error:", err);
            alert(err.message || "Failed to delete employee");
        } finally {
            setDeleting(false);
        }
    };

    const filteredEmployees = employees.filter(emp => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            emp.name?.toLowerCase().includes(query) ||
            emp.email?.toLowerCase().includes(query) ||
            emp.role?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Employees</h2>
                    <p className="text-gray-600">Manage team members and their permissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchEmployees}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                    <button
                        onClick={fetchEmployees}
                        className="ml-2 underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && employees.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
            )}

            {/* Employee Table */}
            {!loading && (
                <EmployeeTable
                    employees={filteredEmployees}
                    onEdit={() => { }}
                    onDelete={(emp) => setDeleteConfirm(emp)}
                    onUpdatePermissions={handleUpdatePermissions}
                    onUpdateRole={handleUpdateRole}
                    currentUserId={currentUserId}
                    lang={lang}
                />
            )}

            {/* Create Employee Modal */}
            <CreateEmployeeModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    fetchEmployees();
                }}
                lang={lang}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Employee</h3>
                                <p className="text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
                            This will remove their account and all associated data.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
