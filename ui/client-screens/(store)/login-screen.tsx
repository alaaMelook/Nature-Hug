"use client"
import {useRouter} from "next/navigation";
import {googleLogin} from "@/ui/hooks/store/useLoginActions";
import React, {useEffect, useState} from "react";
import {useForm} from 'react-hook-form';
import {FcGoogle} from "react-icons/fc";
import {useSupabase} from "@/ui/hooks/useSupabase";

export function LoginScreen() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState("");

    const {login, user, loading} = useSupabase();
    const {register, handleSubmit, formState: {errors}} = useForm<{ email: string, password: string }>({
        defaultValues: {email: '', password: ''}
    });

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const onSubmit = async (data: { email: string, password: string }) => {
        setErrorMsg('');
        try {
            await login(data.email, data.password);
        } catch (error: any) {
            setErrorMsg(error.message || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="flex flex-col items-center align-items-center justify-center max-h-screen space-y-6 mt-10">
            <h1 className="text-2xl font-bold ">Login</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4 w-72">
                <input
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email'}
                    })}
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded"
                    disabled={loading}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

                <input
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {value: 6, message: 'Password must be at least 6 characters'}
                    })}
                    type="password"
                    placeholder="Password"
                    className="border p-2 rounded"
                    disabled={loading}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-primary-900 text-white rounded-md cursor-pointer"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/signup")}
                    disabled={loading}
                    className="px-6 py-3 bg-primary-200 text-primary-900 rounded-md cursor-pointer"
                >
                    Sign Up
                </button>
            </form>

            <div className="flex items-center w-72">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-2 text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <button
                onClick={googleLogin}
                disabled={loading}
                className="cursor-pointer flex items-center justify-center w-fit gap-3 px-15 py-3 border border-gray-200 rounded-md bg-white shadow-sm hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <FcGoogle className="text-xl"/>
                {"Continue with Google"}
            </button>

            {errorMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-72">
                    {errorMsg}
                </div>
            )}
        </div>
    );
}