"use client";

import { useTranslation, Trans } from "react-i18next";

export default function VerifyScreen({ email }: { email: string }) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-primary-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                {/* Illustration */}
                <div className="flex justify-center mb-6">
                    <img src={'/email_verify.png'} className="rounded-full"
                        alt={'email_verified_photo'} />
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
            </div>
        </div>
    );
}
