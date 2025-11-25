'use client'
import { SocialIcon } from "react-social-icons";
import { SquareArrowOutUpRight } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { CollapsibleSection } from "@/ui/components/store/CollapsibleSection";
import { useTranslation } from "react-i18next";

const ContactMethod = ({ title, value, link }: { title: string, value: string, link: string }) => (
    <a className={'flex items-center justify-start'} href={link} target="_blank">
        <SocialIcon url={link} as={'div'} className={'border-primary-800 border-1 rounded-4xl'} bgColor={'white'}
            fgColor={'#603b23'} />
        <div className={'flex flex-col justify-start align-middle px-5'}>

            <p className="text-lg font-semibold text-black">{title}</p>
            {/* Value uses a slightly darker green for professionalism */}
            <p className="text-primary-600 font-semibold text-sm flex" >{value}
                <SquareArrowOutUpRight className={'mx-2 w-3 h-3 self-center'}></SquareArrowOutUpRight>
            </p>
        </div>

    </a>

);

export default function Contact() {
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const { t } = useTranslation();
    const handleToggle = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    // The translated Arabic strings are integrated into the text.
    return (
        // Changed main background to crisp white
        <div className="min-h-screen overflow-x-hidden px-5 sm:px-0">
            <div className="text-center my-10">
                <h2 className="text-2xl font-bold text-primary-800 mb-4">
                    {t('contactFaqTitle')}
                </h2>
                <p className="text-lg text-gray-600 mx-auto max-w-2xl">
                    {t('contactFaqIntro')}
                </p>
            </div>
            <div className="w-full md:px-20 ">
                <CollapsibleSection
                    id={"faq1"}
                    title={t('faq1Title')}
                    content={t('faq1Content')}
                    isOpen={openFaq === "faq1"}
                    onToggleAction={() => handleToggle("faq1")}
                />
                <CollapsibleSection id={"faq6"}
                    title={t('faq6Title')}
                    content={t('faq6Content')}
                    isOpen={openFaq === "faq6"}
                    onToggleAction={() => handleToggle("faq6")}
                />
                <CollapsibleSection

                    id={"faq2"}
                    title={t('faq2Title')}
                    content={t('faq2Content')}
                    isOpen={openFaq === "faq2"}
                    onToggleAction={() => handleToggle("faq2")}
                />
                <CollapsibleSection
                    id={"faq3"}
                    title={t('faq3Title')}
                    content={t('faq3Content')}
                    isOpen={openFaq === "faq3"}
                    onToggleAction={() => handleToggle("faq3")}
                />
                <CollapsibleSection
                    id={"faq4"}
                    title={t('faq4Title')}
                    content={t('faq4Content')}
                    isOpen={openFaq === "faq4"}
                    onToggleAction={() => handleToggle("faq4")}
                />

                <div className="mb-10"></div>
            </div>
            {/* --- Header Section --- */}
            <div className=" text-center ">
                <h3 className="mt-2 text-xl text-gray-900 font-medium ">
                    {t('contactHeader')}
                </h3>
                {/* --- Introductory Text (More professional green tones) --- */}
                <p className="text-center text-md  text-gray-500 font-medium mx-auto mb-10">
                    {t('contactIntro')}
                </p>


                {/* --- Main Content Area --- */}


                {/* --- Contact Methods Section --- */}
                {/* Centered grid with professional links */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-40 gap-y-10 max-w-4xl sm:mx-auto sm:mt-10 my-2 align-bottom mx-15 mb-20"> {[

                        <ContactMethod
                            title={t('contactMethodSupport')}
                            value="01090998664"
                            link="https://wa.me/201090998664" // Using international format for best compatibility
                        />
                        ,
                        <ContactMethod
                            title={t('contactMethodReply')}
                            value="naturehug@gmail.com"
                            link="mailto:naturehug@gmail.com"
                        />
                        ,
                        <ContactMethod
                            title={t('contactMethodFollow')}
                            value="@NatureHugOfficial"
                            link="https://instagram.com/NatureHugOfficial"
                        />
                        ,
                        <ContactMethod
                            title={t('contactMethodShare')}
                            value="/NatureHugOfficial"
                            link="https://facebook.com/NatureHugOfficial"
                        />
                    ].map((method, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {method}
                        </motion.div>


                    ))}
                </div>
            </div>

        </div>
    );
}