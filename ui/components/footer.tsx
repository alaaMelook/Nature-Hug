'use client'
import React from "react";
import { useTranslation } from "react-i18next";

export function Footer() {
    const { t } = useTranslation()
    return (
        <footer className=" bg-primary-50 font-semibold text-gray-700 py-8  w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm md:text-base">
                    &copy; Nature Hug 2025.{" "}
                    {t("allRightsReserved")}
                </p>
            </div>
        </footer>
    );
}