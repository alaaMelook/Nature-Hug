"use client";

import { useTranslation, Trans } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function VerifyScreen({ email }: { email: string }) {
    const { t } = useTranslation();

    // Fix hydration mismatch - wait for client mount before rendering translated content
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <div className="min-h-screen bg-primary-100 flex items-center justify-center px-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md p-8 max-w-md w-full"
            >
                {/* Illustration */}
                <div className="flex justify-center mb-6">
                    <Image src={'/email_verify.png'} className="rounded-full"
                        alt={'email_verified_photo'}

                        fill={true}
                    />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold mb-3  text-center">{t('verify.title')}</h2>

                {/* Message */}
                <p className="text-gray-600 mb-6 text-justify">
                    <Trans i18nKey="verify.message" values={{ email }} components={{ 1: <span className="font-medium text-gray-900" /> }} />
                    <br />
                    <br />
                    {t('verify.instruction')}
                </p>
            </motion.div>
        </div>
    );
}
