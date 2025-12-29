'use client';

import { ProfileView } from "@/domain/entities/views/shop/profileView";
import { OrderSummaryView } from "@/domain/entities/views/shop/orderSummaryView";
import { EmployeePermissions, DEFAULT_EMPLOYEE_PERMISSIONS, PERMISSION_MODULES } from "@/domain/entities/auth/permissions";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Mail, Phone, MapPin, Calendar, Shield, User, Package, X, UserPlus } from "lucide-react";
import { Member } from "@/domain/entities/auth/member";
import { motion } from "framer-motion";

interface CustomerProfileScreenProps {
    customer: ProfileView;
    orders: OrderSummaryView[];
    member: Member | null;
    onPromote: (role: MemberRole, permissions?: EmployeePermissions) => Promise<void>;
    onRevoke: () => Promise<void>;
}

export function CustomerProfileScreen({ customer, orders, member, onPromote, onRevoke }: CustomerProfileScreenProps) {
    const { t } = useTranslation();
    const [isPromoting, setIsPromoting] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [showMakeEmployeeModal, setShowMakeEmployeeModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("moderator");
    const [permissions, setPermissions] = useState<EmployeePermissions>(DEFAULT_EMPLOYEE_PERMISSIONS);

    const handlePromote = async (role: MemberRole) => {
        setIsPromoting(true);
        try {
            await onPromote(role);
        } catch (error) {
            console.error("Failed to promote customer:", error);
        } finally {
            setIsPromoting(false);
        }
    };

    const handleMakeEmployee = async () => {
        setIsPromoting(true);
        try {
            await onPromote(selectedRole as MemberRole, permissions);
            setShowMakeEmployeeModal(false);
        } catch (error) {
            console.error("Failed to make employee:", error);
        } finally {
            setIsPromoting(false);
        }
    };

    const handleRevoke = async () => {
        if (!confirm(t("confirmRevokeRole"))) return;
        setIsRevoking(true);
        try {
            await onRevoke();
        } catch (error) {
            console.error("Failed to revoke role:", error);
        } finally {
            setIsRevoking(false);
        }
    };

    const togglePermission = (module: keyof EmployeePermissions) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                view: !prev[module]?.view
            }
        }));
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{customer.name}</h2>
                        <div className="flex items-center mt-2 space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                ID: {customer.id}
                            </span>
                            {member && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    <Shield className="w-3 h-3 mr-1" />
                                    {t(member.role)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2 flex-wrap gap-2">
                        {member ? (
                            <>
                                <button
                                    onClick={handleRevoke}
                                    disabled={isRevoking}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    {t("revokeRole")}
                                </button>
                                <button
                                    onClick={() => setShowMakeEmployeeModal(true)}
                                    disabled={isPromoting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Edit Permissions
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowMakeEmployeeModal(true)}
                                    disabled={isPromoting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Make Employee
                                </button>
                                <button
                                    onClick={() => handlePromote('moderator')}
                                    disabled={isPromoting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    {t("makeModerator")}
                                </button>
                                <button
                                    onClick={() => handlePromote('admin')}
                                    disabled={isPromoting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    {t("makeAdmin")}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Details Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white shadow rounded-lg p-6 md:col-span-1"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            {t("customerDetails")}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t("email")}</p>
                                    <p className="text-sm text-gray-900">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t("phone")}</p>
                                    {customer.phone.length > 0 ? (
                                        customer.phone.map((p, i) => (
                                            <p key={i} className="text-sm text-gray-900">{p}</p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">{t("noPhone")}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t("addresses")}</p>
                                    {customer.address && customer.address.length > 0 ? (
                                        customer.address.map((addr) => (
                                            <div key={addr.id} className="mb-2 last:mb-0">
                                                <p className="text-sm text-gray-900">{addr.address}</p>
                                                <p className="text-xs text-gray-500">{addr.governorate.name_en}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">{t("noAddress")}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{t("joinedDate")}</p>
                                    <p className="text-sm text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white shadow rounded-lg p-6 md:col-span-2"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            {t("orderHistory")}
                        </h3>
                        <div className="overflow-hidden">
                            {orders.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t("orderId")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t("date")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t("status")}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t("total")}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.order_id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{order.order_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                        {t(order.order_status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.grand_total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500 text-sm">{t("noOrders")}</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Make Employee Modal */}
            {showMakeEmployeeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {member ? "Edit Employee Permissions" : "Make Employee"}
                            </h2>
                            <button
                                onClick={() => setShowMakeEmployeeModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-medium text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g. moderator, manager, accountant"
                                    list="role-options"
                                />
                                <datalist id="role-options">
                                    <option value="admin" />
                                    <option value="moderator" />
                                    <option value="user" />
                                    <option value="manager" />
                                    <option value="accountant" />
                                    <option value="support" />
                                </datalist>
                            </div>

                            {/* Permissions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Access Permissions
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {PERMISSION_MODULES.map((module) => (
                                        <label
                                            key={module}
                                            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-primary-300"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={permissions[module]?.view ?? false}
                                                onChange={() => togglePermission(module)}
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 capitalize">{module}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allEnabled: EmployeePermissions = {} as EmployeePermissions;
                                        PERMISSION_MODULES.forEach(m => allEnabled[m] = { view: true });
                                        setPermissions(allEnabled);
                                    }}
                                    className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                    Select All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const noneEnabled: EmployeePermissions = {} as EmployeePermissions;
                                        PERMISSION_MODULES.forEach(m => noneEnabled[m] = { view: false });
                                        setPermissions(noneEnabled);
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-700"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowMakeEmployeeModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMakeEmployee}
                                disabled={isPromoting}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isPromoting && (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {member ? "Update Employee" : "Make Employee"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
