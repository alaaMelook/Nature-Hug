/**
 * Note: This file is a static content page, so we don't need 'use client',
 * useRouter, or any state hooks. We'll simplify it to a pure functional component.
 */

import React from 'react';

// Simplified AboutNatureHug Component (Focus on structure and readability)
export default function About() {

    // Helper for rendering a value item - now accepts 'children' for rich content
    const ValueItem = ({icon, children}: { icon: string, children: React.ReactNode }) => (
        <div className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
            <div className="text-2xl text-gray-700">{icon}</div>
            {/* Renders children, allowing bolding and other JSX formatting */}
            <p className="text-primary-950 font-medium">{children}</p>
        </div>
    );

    // Helper for rendering a goal item - now accepts 'children' for rich content
    const GoalItem = ({icon, children}: { icon: string, children: React.ReactNode }) => (
        <li className="flex items-start space-x-3 ">
            <div className="text-xl text-primary-950 mt-0.5">{icon}</div>
            {/* Renders children, allowing bolding and other JSX formatting */}
            <p className="text-primary-950 font-medium">{children}</p>
        </li>
    );

    return (
        // Maximize height and remove scrollability (h-screen and overflow-hidden)
        <div className=" w-full bg-white p-6 md:p-10 lg:p-12 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full flex flex-col">

                {/* --- Header Section --- */}
                <header className="text-center mb-6">
                    <h1 className="text-5xl font-light tracking-tight text-gray-900 leading-none">
                        NATURE HUG
                    </h1>
                    <p className="mt-1 text-lg text-gray-500 font-extralight italic">
                        Therapeutic Care, Touched by Nature 🌿
                    </p>
                </header>

                {/* --- Main Content Area (Uses flex-col to stack 2-column layout and Core Values) --- */}

                {/* --- Middle Section: TWO-COLUMN LAYOUT (Our Goals | Story, Vision, KeraCalm) --- */}
                {/* flex-grow allows this section to take up available height before the Values section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-grow  h-full pr-2">

                    {/* ---------------------------------------------------- */}
                    {/* --- NEW LEFT COLUMN: Our Goals (The List) --- */}
                    {/* ---------------------------------------------------- */}
                    <div className="flex flex-col space-y-2">

                        <section className={' p-4 rounded-xl shadow-md border border-primary-600'}>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2 ">
                                <span className="text-gray-600 mr-2">🌸</span> Our Story
                            </h2>
                            <p className="text-base text-gray-700 leading-snug">
                                An <span className="font-semibold">Egyptian brand</span> founded by a <span
                                className="font-semibold">pharmacist</span>. We blend medical-grade effectiveness
                                with the gentleness of nature to restore skin confidence.
                            </p>
                            <div className="bg-amber-50-50 p-3 rounded-xl shadow-md border border-amber-200">
                                <p className="text-base font-semibold text-amber-800 leading-snug">
                                    <span className="font-semibold">KeraCalm:</span> The first safe <span
                                    className="font-semibold">40% urea cream</span> in Egypt. Treats stubborn issues;
                                    delivers visible results from the first use. <span
                                    className="font-semibold">💖</span>
                                </p>
                            </div>
                        </section>

                        {/* KeraCalm Highlight - Thematic block */}


                        {/* Vision (Compact Text) */}
                        <section className={' p-4 rounded-xl shadow-md border border-primary-600'}>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                <span className="text-gray-600 mr-2">🔮</span> Our Vision
                            </h2>
                            <p className="text-base text-gray-700 leading-snug">
                                To be the #1 skincare choice for Arab women, redefining beauty care as a <span
                                className="font-semibold">psychological
                                    and emotional therapy</span>, not just a routine.
                            </p>
                        </section>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* --- RIGHT COLUMN: Story, KeraCalm, Vision (The Text Blocks) --- */}
                    {/* ---------------------------------------------------- */}

                    <div className="flex flex-col space-y-2">

                        {/* Goals Section - MOVED FROM BOTTOM */}
                        <section className={' p-6 rounded-xl shadow-md border border-primary-600'}>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                                <span className="text-gray-600 mr-2">🎯</span> Our Goals
                            </h2>
                            {/* Tight list for goals - removed flex-wrap as it is now in a single column */}
                            <ul className="space-y-2 list-none p-2">
                                <GoalItem icon="🧪">
                                    Develop safe, high-impact products with powerful natural ingredients.
                                </GoalItem>
                                <GoalItem icon="🌹">
                                    Strengthen women’s self-confidence through visible, authentic results.
                                </GoalItem>
                                <GoalItem icon="🎨">
                                    Create a transparent and emotionally rich brand experience.
                                </GoalItem>
                                <GoalItem icon="💬">
                                    Inspire women to love their natural features and rise above stereotypes.
                                </GoalItem>
                                <GoalItem icon="🔍">
                                    Maintain the highest quality standards and continuously innovate.
                                </GoalItem>
                            </ul>
                        </section>
                    </div>
                    <section className="border-gray-100 flex-shrink-0 col-span-2">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                            <span className="text-gray-600 mr-2">💫</span> Core Values
                        </h2>
                        {/* Values Grid - now full width, optimized for larger screens with 3 columns */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                            <ValueItem icon="✅">
                                <span className="font-semibold">Transparency</span> in formulas.
                            </ValueItem>
                            <ValueItem icon="🌟">
                                <span className="font-semibold">Excellence</span> in results.
                            </ValueItem>
                            <ValueItem icon="🍃">
                                <span className="font-semibold">Nature</span> as inspiration.
                            </ValueItem>
                            <ValueItem icon="🎁">
                                <span className="font-semibold">Love of detail</span> in design.
                            </ValueItem>
                            <ValueItem icon="💪">
                                <span className="font-semibold">Empowerment</span> & confidence.
                            </ValueItem>
                            <ValueItem icon="🤍">
                                <span className="font-semibold">Genuine care</span> from touch.
                            </ValueItem>
                        </div>
                    </section>
                </div>

                {/* --- Bottom Section: Core Values (FULL WIDTH - MOVED FROM LEFT COLUMN) --- */}
                {/* Added lg:grid-cols-3 to spread the values out nicely across the full width */}

            </div>


        </div>
    );
}
