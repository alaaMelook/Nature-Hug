"use client";
import {useRef, useState} from "react";
import {FcGoogle} from "react-icons/fc";
import {googleLogin, signup} from "@/ui/hooks/store/useLoginActions";
import {useForm} from 'react-hook-form';

export function SignupScreen() {
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const formRef = useRef<HTMLFormElement | null>(null);

    const {register, handleSubmit, formState: {errors}} = useForm<{
        fullName: string,
        phone: string,
        email: string,
        password: string
    }>({
        defaultValues: {fullName: '', phone: '', email: '', password: ''}
    });

    // called after react-hook-form validation succeeds
    const onValidated = (data: { fullName: string, phone: string, email: string, password: string }) => {
        try {
            setLoading(true);
            // submit the native form to call the server action `signup`
            formRef.current?.requestSubmit();
        } catch (err) {
            setLoading(false);
            setErrorMsg('Failed to submit form.');
        }
    }

    return (
        <div
            className="max-w-md mx-auto flex flex-col my-5  p-6 bg-white shadow rounded max-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

            {/* native form posts to server action `signup` */}
            <form ref={formRef} action={signup} className="space-y-4">
                <input
                    {...register('fullName', {required: 'Full name is required'})}
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full border px-3 py-2 rounded"
                    disabled={loading}
                />
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}

                <input
                    {...register('phone', {
                        required: 'Phone is required',
                        minLength: {value: 6, message: 'Enter a valid phone'}
                    })}
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    className="w-full border px-3 py-2 rounded"
                    disabled={loading}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}

                <input
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email'}
                    })}
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded"
                    disabled={loading}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

                <input
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {value: 6, message: 'Password must be at least 6 characters'}
                    })}
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full border px-3 py-2 rounded"
                    disabled={loading}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

                <button
                    type="button"
                    className="w-full bg-primary-600 text-white py-2 rounded"
                    onClick={() => handleSubmit(onValidated)()}
                    disabled={loading}
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>

            <div className="flex items-center w-full mt-4 mb-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-2 text-gray-500">OR</span>
                <div className="flex-1 h-px  bg-gray-300"></div>
            </div>

            <button
                onClick={async () => {
                    setGoogleLoading(true);
                    // call server action
                    await googleLogin();
                }}
                disabled={googleLoading}
                className="cursor-pointer flex items-center justify-center w-full border border-gray-200 gap-3 px-15 py-3 rounded-md bg-white shadow-sm hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <FcGoogle className="text-xl"/>
                {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            {errorMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-72">
                    {errorMsg}
                </div>
            )}
        </div>
    );
}
