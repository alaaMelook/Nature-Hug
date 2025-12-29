"use client";

import { useState } from "react";
import { X, Eye, EyeOff, RefreshCcw, Loader2 } from "lucide-react";
import { EmployeePermissions, DEFAULT_EMPLOYEE_PERMISSIONS, PERMISSION_MODULES } from "@/domain/entities/auth/permissions";

interface CreateEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lang: string;
}

export default function CreateEmployeeModal({
    isOpen,
    onClose,
    onSuccess,
    lang
}: CreateEmployeeModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

    // Form fields
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<MemberRole>("moderator");
    const [permissions, setPermissions] = useState<EmployeePermissions>(DEFAULT_EMPLOYEE_PERMISSIONS);

    const resetForm = () => {
        setEmail("");
        setName("");
        setPhone("");
        setPassword("");
        setRole("moderator");
        setPermissions(DEFAULT_EMPLOYEE_PERMISSIONS);
        setError(null);
        setGeneratedPassword(null);
        setAutoGeneratePassword(true);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
        let pwd = '';
        for (let i = 0; i < 12; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(pwd);
        setAutoGeneratePassword(false);
    };

    const togglePermission = (module: keyof EmployeePermissions, action: string) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: !prev[module]?.[action as keyof typeof prev[typeof module]]
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/${lang}/admin/employees/api`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    name,
                    phone: phone || undefined,
                    role,
                    password: autoGeneratePassword ? undefined : password,
                    autoGeneratePassword,
                    permissions,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Failed to create employee");
            }

            // Show generated password if available
            if (result.data?.generatedPassword) {
                setGeneratedPassword(result.data.generatedPassword);
            } else {
                handleClose();
                onSuccess();
            }
        } catch (err: any) {
            console.error("Create employee error:", err);
            setError(err.message || "Failed to create employee");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAndClose = () => {
        if (generatedPassword) {
            navigator.clipboard.writeText(generatedPassword);
        }
        handleClose();
        onSuccess();
    };

    if (!isOpen) return null;

    // Show generated password screen
    if (generatedPassword) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Created!</h3>
                        <p className="text-gray-600 mb-4">
                            Share this password with <strong>{name}</strong>:
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-lg break-all">
                            {generatedPassword}
                        </div>
                        <p className="text-sm text-amber-600 mb-6">
                            ⚠️ This password will not be shown again. Make sure to copy it now.
                        </p>
                        <button
                            onClick={handleCopyAndClose}
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Copy & Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Full name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="employee@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="+20 123 456 7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value as MemberRole)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. admin, moderator, manager, accountant"
                                list="role-suggestions"
                                required
                            />
                            <datalist id="role-suggestions">
                                <option value="admin" />
                                <option value="moderator" />
                                <option value="user" />
                                <option value="manager" />
                                <option value="accountant" />
                                <option value="support" />
                            </datalist>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoGeneratePassword}
                                    onChange={(e) => {
                                        setAutoGeneratePassword(e.target.checked);
                                        if (e.target.checked) setPassword("");
                                    }}
                                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                Auto-generate password
                            </label>
                        </div>
                        {!autoGeneratePassword && (
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter password"
                                    minLength={6}
                                    required={!autoGeneratePassword}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="p-1.5 text-gray-400 hover:text-gray-600"
                                        title="Generate random password"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Permissions */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Permissions</h3>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {PERMISSION_MODULES.map((module) => (
                                    <label
                                        key={module}
                                        className="flex items-center p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-primary-300"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={permissions[module]?.view ?? false}
                                            onChange={() => togglePermission(module, 'view')}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{module}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Select which sections this employee can access
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
