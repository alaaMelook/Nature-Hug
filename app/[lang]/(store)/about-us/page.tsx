'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flower, Heart, Leaf, Smile, Sparkles, Target, Rocket, Box, Zap } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

export default function AboutPage() {
    const { t, } = useTranslation();
    const ICONS: Record<string, React.ComponentType<any>> = {
        CheckCircle,
        Flower,
        Heart,
        Leaf,
        Smile,
        Sparkles,
        Target,
        Rocket,
        Box,
        Zap,
    };
    return (
        <main className="bg-white text-gray-800 overflow-x-hidden">
            {/* ===== Hero Section ===== */}
            <section className="text-center py-24 px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl font-light tracking-wide text-gray-900"
                >
                    <Trans i18nKey="aboutUsTitle" components={{ br: <br /> }} />
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mt-3 text-gray-500 italic"
                >
                    <Trans i18nKey="aboutUsDescription" components={{ span: <span className="text-green-700" /> }} />

                </motion.p>
            </section>

            {/* ===== Story Section ===== */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="flex items-center gap-3">

                            <Flower className="w-6 h-6 text-green-600 mb-3" />
                            <h2 className="text-3xl font-semibold mb-4">{t("ourStory")}</h2>
                        </span>
                        <p className="leading-relaxed text-gray-700 mb-6">

                            <Trans i18nKey="egyptianBrand" components={{ strong: <strong /> }} />
                        </p>
                        <p className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm text-gray-800">
                            <Trans i18nKey="keracalm" components={{ strong: <strong /> }} />
                        </p>
                        <p className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm text-gray-800">
                            <Trans i18nKey="keracalm" components={{ strong: <strong /> }} />
                        </p>
                        <p className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm text-gray-800">
                            <Trans i18nKey="foundation" components={{ br: <br /> }} />
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

                            {/* {(t("cores", { returnObjects: true }) as any[]).map((core, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <core.icon className={`w-6 h-6 text-${core.color}-600`} />
                                    <p className="text-gray-700">{core.text}</p>
                                </div>
                            ))} */}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="md:pl-8"
                    >
                        <span className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-green-600 mb-3" />
                            <h2 className="text-3xl font-semibold mb-4">{t("ourVision")}</h2>
                        </span>
                        <p className="leading-relaxed text-gray-700">
                            <Trans i18nKey="vision" components={{ strong: <strong /> }} />
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ===== Mission / Goals Section ===== */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="flex items-center gap-3 mb-3 justify-center">
                            <Heart className="w-6 h-6 text-pink-500" />
                            <h2 className="text-3xl font-semibold">{t("ourGoals")}</h2>
                        </span>
                        <ul className="space-y-4 text-gray-700 text-base text-left sm:text-center leading-relaxed">
                            {(t("goals", { returnObjects: true }) as any[]).map((goal, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <span>{goal}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* ===== Core Values Section ===== */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <span className="flex items-center gap-3 mb-3 justify-center">
                            <Sparkles className="w-6 h-6 text-yellow-500 " />
                            <h2 className="text-3xl font-semibold">{t("corevalues")}</h2>
                        </span>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            <Trans i18nKey="foundation" components={{ br: <br /> }} />
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left md:text-center">
                        {(t("cores", { returnObjects: true }) as any[]).map((v, i) => {
                            const Icon = typeof v.icon === 'string' ? ICONS[v.icon] ?? Leaf : v.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center md:justify-center gap-3"
                                >
                                    <Icon className={`w-8 h-8 text-${v.color}-600 flex-shrink-0`} />
                                    <p className="font-medium text-gray-700">{v.text}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== Footer ===== */}

        </main>
    );
}
