'use client'
import {SocialIcon} from "react-social-icons";
import {SquareArrowOutUpRight} from "lucide-react";

const ContactMethod = ({title, value, link}: { title: string, value: string, link: string }) => (
    <a className={'flex items-center justify-start'} href={link} target="_blank">
        <SocialIcon url={link} title={title} as={'div'}/>
        <div className={'flex flex-col justify-start align-middle p-0 px-5'}>

            <p className="text-lg font-semibold text-gray-800 my-0 py-0">{title}</p>
            {/* Value uses a slightly darker green for professionalism */}
            <p className="text-primary-900 font-semibold text-sm my-0 py-0 flex">{value}
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
        <div className="h-full w-full bg-white p-6 md:p-10 lg:p-12 overflow-hidden">

            {/* --- Header Section --- */}
            <header className="text-center mb-10">
                <h3 className="mt-2 text-3xl text-primary-900 font-medium ">
                    We'd love to hear from you!
                </h3>
                {/* --- Introductory Text (More professional green tones) --- */}
                <p className="text-center text-md  text-primary-600 font-semibold mx-50% ">
                    Your journey with us doesn't end with your order... <br/>
                    We're always here to listen to you, help you, and care for your true beauty 🌿
                </p>
            </header>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col w-full space-y-10">


                {/* --- Contact Methods Section --- */}
                <section>
                    {/*               <h2 className="text-3xl font-semibold text-gray-900 mb-5 text-center">
                            Connect with Nature Hug
                        </h2>*/}
                    {/* <p className="text-base text-gray-700 mb-8 text-center max-w-2xl mx-auto">
                            If you have a question, suggestion, or would even like to share your experience with us,
                            contact us through the method that suits you:
                        </p>*/}

                    {/* Centered grid with professional links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto my-10">

                        <ContactMethod
                            title={'Contact support immediately'}
                            value="01090998664"
                            link="https://wa.me/201090998664" // Using international format for best compatibility
                        />

                        <ContactMethod
                            title={'We will reply within 24 hours'}
                            value="naturehug@gmail.com"
                            link="mailto:naturehug@gmail.com"
                        />

                        <ContactMethod
                            title={'Follow us for latest offers'}
                            value="@NatureHugOfficial"
                            link="https://instagram.com/NatureHugOfficial"
                        />

                        <ContactMethod
                            title={'Share your opinion with us'}
                            value="/NatureHugOfficial"
                            link="https://facebook.com/NatureHugOfficial"
                        />
                    </div>
                </section>

                {/* --- Closing Statement (Using a richer, more muted green tone) --- */}


            </div>
            <div
                className="mt-10 py-5 text-center ">
                <p className="text-center text-md  text-primary-600 font-semibold mx-50%">
                    Every message from you means a lot to us, and we promise you'll always find a team that
                    cares <br/>
                    We are here... with open hearts for you 💚
                </p>

            </div>

        </div>
    );
}