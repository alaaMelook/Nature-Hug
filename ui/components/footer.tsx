'use client'
import React from "react";
import {useTranslation} from "@/ui/providers/TranslationProvider";

export function Footer() {
    const {t} = useTranslation()
    return (
        <footer className=" bg-primary-50 font-semibold text-gray-700 py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm md:text-base">
                    &copy; {new Date().getFullYear()} Hug Nature.{" "}
                    {t("allRightsReserved")}
                </p>
            </div>
        </footer>
    );
}