'use client';
import React from 'react';
import Image from "next/image";
import { motion } from 'framer-motion';
import { CheckCircle, Flower, Heart, Leaf, Smile, Sparkles, Target, Rocket, Box, Zap, Eye } from 'lucide-react';
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
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 md:gap-30 gap-15 items-center text-lg md:text-sm">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="flex items-center gap-3 mb-5">

                            <Flower className="w-6 h-6 text-green-600" />
                            <h2 className="text-3xl font-semibold ">{t("ourStory")}</h2>
                        </span>
                        <p className="leading-relaxed text-gray-700 md:text-lg">

                            <Trans i18nKey="egyptianBrand" components={{ strong: <strong /> }} />
                        </p>


                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="md:pl-8"
                    >
                        <span className="flex items-center gap-3 mb-5">
                            <Eye className="w-6 h-6 text-primary-600" />
                            <h2 className="text-3xl font-semibold">{t("ourVision")}</h2>
                        </span>
                        <p className="leading-relaxed text-gray-700 md:text-lg">
                            <Trans i18nKey="vision" components={{ strong: <strong /> }} />
                        </p>
                    </motion.div>
                </div>
            </section>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >

                <div className="bg-primary-100 border border-gray-100 rounded-xl px-10 md:px-15 py-10 text-sm text-gray-800 flex flex-col md:flex-row md:gap-30 items-center justify-center gap-10">
                    <Image src="https://reqrsmboabgxshacmkst.supabase.co/storage/v1/object/public/nature-hug/kera-photo.png" alt="Kera Photo"
                        width={200} height={200}
                        style={{ objectFit: 'cover' }}
                        className="rounded-full border-5 border-primary-900 " >
                    </Image>
                    <span className='w-full md:w-2/5 text-center md:text-start text-lg'>

                        <Trans i18nKey="keracalm" components={{ strong: <strong />, br: <br />, b: <b className='font-semibold italic' /> }} />
                    </span>

                </div>
            </motion.div>
            {/* ===== Mission / Goals Section ===== */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 md:gap-30 gap-15 text-lg md:text-sm">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="flex items-center gap-3 mb-8 ">
                            <Target className="w-6 h-6 text-green-600 " />
                            <h2 className="text-3xl font-semibold">{t("ourGoals")}</h2>
                        </span>
                        <ul className="space-y-2 text-gray-700 text-base text-start">
                            {(t("goals", { returnObjects: true }) as any[]).map((goal, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-start justify-start text-start flex-start gap-2"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <span>{goal}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <div className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="font-semibold"
                        >
                            <span className="flex gap-3 mb-2 items-center">
                                <Sparkles className="w-6 h-6 text-yellow-500 " />
                                <h2 className="text-3xl font-semibold">{t("corevalues")}</h2>
                            </span>
                            <p className="text-gray-600 md:text-sm text-md w-full mb-8">
                                <Trans i18nKey="foundation" components={{ br: <br /> }} />
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2  md:gap-10 gap-5 text-start mx-10">
                            {(t("cores", { returnObjects: true }) as any[]).map((v: any, i) => {
                                const Icon = typeof v.icon === 'string' ? ICONS[v.icon] ?? Leaf : v.icon;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex text-start gap-3"
                                    >
                                        <Icon className={`w-6 h-6 text-${v.color}-500 `} />
                                        <p className="font-medium text-gray-700 text-sm">{v.text}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
            {/* ===== Footer ===== */}

        </main>
    );
}
