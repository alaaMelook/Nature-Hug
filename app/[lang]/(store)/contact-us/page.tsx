'use client'
import { SocialIcon } from "react-social-icons";
import { SquareArrowOutUpRight } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

const ContactMethod = ({ title, value, link }: { title: string, value: string, link: string }) => (
    <a className={'flex items-center justify-start'} href={link} target="_blank">
        <SocialIcon url={link} as={'div'} className={'border-primary-800 border-1 rounded-4xl'} bgColor={'white'}
            fgColor={'#603b23'} />
        <div className={'flex flex-col justify-start align-middle p-0 px-5'}>

            <p className="text-lg font-semibold text-black my-0 py-0">{title}</p>
            {/* Value uses a slightly darker green for professionalism */}
            <p className="text-primary-600 font-semibold text-sm my-0 py-0 flex" >{value}
                <SquareArrowOutUpRight className={'mx-2 w-3 h-3 self-center'}></SquareArrowOutUpRight>
            </p>
        </div>

    </a>

);

export default function Contact() {
    // The translated Arabic strings are integrated into the text.
    const arabicIntroTranslation = "Your journey with us doesn't end with your order... We're always here to listen to you, help you, and care for your true beauty 🌿";
    const arabicClosingTranslation = "We are here... with open hearts for you 💚";

    return (
        // Changed main background to crisp white
        <div className="overflow-x-hidden">

            {/* --- Header Section --- */}
            <header className="text-center  my-10">
                <h3 className="mt-2 text-3xl text-gray-900 font-medium ">
                    We'd love to hear from you!
                </h3>
                {/* --- Introductory Text (More professional green tones) --- */}
                <p className="text-center text-md  text-gray-500 font-medium mx-50% ">
                    Your journey with us doesn't end with your order... <br />
                    We're always here to listen to you, help you, and care for your true beauty 🌿
                </p>
            </header>

            {/* --- Main Content Area --- */}


            {/* --- Contact Methods Section --- */}
            {/* Centered grid with professional links */}
            <div
                className="grid grid-cols-1 md:grid-cols-2 gap-x-40 gap-y-10 max-w-4xl sm:mx-auto sm:mt-30 my-2 align-bottom mx-15"> {[

                    <ContactMethod
                        title={'Contact support immediately'}
                        value="01090998664"
                        link="https://wa.me/201090998664" // Using international format for best compatibility
                    />
                    ,
                    <ContactMethod
                        title={'We will reply within 24 hours'}
                        value="naturehug@gmail.com"
                        link="mailto:naturehug@gmail.com"
                    />
                    ,
                    <ContactMethod
                        title={'Follow us for latest offers'}
                        value="@NatureHugOfficial"
                        link="https://instagram.com/NatureHugOfficial"
                    />
                    ,
                    <ContactMethod
                        title={'Share your opinion with us'}
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


            {/* --- Closing Statement (Using a richer, more muted green tone) --- */}


            {/*            <div
                className="mt-10 py-5 text-center ">
                <p className="text-center text-md  text-primary-600 font-semibold mx-50%">
                    Every message from you means a lot to us, and we promise you'll always find a team that
                    cares <br/>
                    We are here... with open hearts for you 💚
                </p>

            </div>*/}

        </div>
    );
}