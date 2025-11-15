"use client";

export default function VerifyScreen({email}: { email: string }) {
    return (
        <div className="min-h-screen bg-primary-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
                {/* Illustration */}
                <div className="flex justify-center mb-6">
                    <img src={'/email_verify.png'} className="rounded-full"
                         alt={'email_verified_photo'}/>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold mb-3  text-center">Verify your email address</h2>

                {/* Message */}
                <p className="text-gray-600 mb-6 text-justify">
                    You’ve entered{" "}
                    <span className="font-medium text-gray-900">{email}</span> as the email
                    address for your account.
                    <br/>
                    <br/>
                    Just click on the link in that email to complete your signup. If you don't see it, you may need to
                    check your spam folder.
                </p>
            </div>
        </div>
    );
}
