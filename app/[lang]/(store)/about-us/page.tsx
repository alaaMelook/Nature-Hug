'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Flower, Heart, Leaf, Smile, Sparkles, Target } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

export default function AboutPage() {
    const { t, } = useTranslation();
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
                            <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
                        </span>
                        <p className="leading-relaxed text-gray-700 mb-6">
                            An <strong>Egyptian brand</strong> founded by a <strong>pharmacist</strong>.
                            We blend medical-grade effectiveness with the gentleness of nature to restore skin
                            confidence.
                        </p>
                        <p className="bg-white border border-gray-100 rounded-xl px-5 py-4 text-sm text-gray-800">
                            <strong>KeraCalm:</strong> The first safe 40% urea cream in Egypt — treats stubborn issues
                            and
                            delivers visible results from the first use. 💖
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="md:pl-8"
                    >
                        <span className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-green-600 mb-3" />
                            <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
                        </span>
                        <p className="leading-relaxed text-gray-700">
                            To be the #1 skincare choice for Arab women, redefining beauty care as a
                            <strong> psychological and emotional therapy</strong>, not just a routine.
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
                            <h2 className="text-3xl font-semibold">Our Goals</h2>
                        </span>
                        <ul className="space-y-4 text-gray-700 text-base text-left sm:text-center leading-relaxed">
                            {[
                                'Develop safe, high-impact products with powerful natural ingredients.',
                                'Strengthen women’s self-confidence through visible, authentic results.',
                                'Build a transparent and emotionally rich brand experience.',
                                'Inspire women to embrace their natural features and rise above stereotypes.',
                                'Maintain the highest quality standards and continuously innovate.',
                            ].map((goal, i) => (
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
                            <h2 className="text-3xl font-semibold">Core Values</h2>
                        </span>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our foundation is built on care, transparency, and a love for natural beauty.
                            Every product reflects our belief in gentle strength and authentic results.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left md:text-center">
                        {[
                            { icon: <Leaf className="text-green-600 w-5 h-5" />, text: 'Nature as inspiration' },
                            { icon: <Sparkles className="text-yellow-600 w-5 h-5" />, text: 'Excellence in results' },
                            { icon: <Smile className="text-orange-500 w-5 h-5" />, text: 'Empowerment & confidence' },
                            { icon: <Heart className="text-pink-500 w-5 h-5" />, text: 'Genuine care from touch' },
                            { icon: <CheckCircle className="text-green-600 w-5 h-5" />, text: 'Transparency in formulas' },
                            { icon: <Flower className="text-purple-500 w-5 h-5" />, text: 'Love of detail in design' },
                        ].map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center md:justify-center gap-3"
                            >
                                {v.icon}
                                <p className="font-medium text-gray-700">{v.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Footer ===== */}

        </main>
    );
}
