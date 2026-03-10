import React from "react";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
                </div>
                <p className="text-sm text-gray-500 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
}
