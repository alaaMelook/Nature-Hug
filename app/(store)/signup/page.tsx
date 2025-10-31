"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {FcGoogle} from "react-icons/fc";
import {googleLogin, signup} from "@/ui/hooks/store/useLoginActions";

export default function SignupPage() {
    const router = useRouter();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [form, setForm] = useState({
        email: "",
        password: "",
        fullName: "",
        phone: "",
    });
    const [message, setMessage] = useState("");


    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
            <form className="space-y-4">
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-2 rounded"
                    formAction={signup}
                >
                    Sign Up
                </button>
            </form>

            <div className="flex items-center w-full mt-4 mb-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-2 text-gray-500">OR</span>
                <div className="flex-1 h-px  bg-gray-300"></div>
            </div>

            <button
                onClick={googleLogin}
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

            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}
