"use client"
import {useRouter} from "next/navigation";
import {useSupabase} from "@/ui/hooks/useSupabase";
import React, {useState} from "react";

export function LoginScreen() {
    const router = useRouter();
    const {signInWithGoogle, signInWithEmail} = useSupabase();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);
        try {
            const {error} = await signInWithEmail(email, password);
            if (error) {
                throw error;
            }
            router.push("/profile");
        } catch (err: any) {
            setErrorMsg(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setErrorMsg(err.message || "Google login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
            <h1 className="text-2xl font-bold">Login</h1>

            <form onSubmit={handleEmailLogin} className="flex flex-col space-y-4 w-72">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                    required
                    disabled={loading}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded"
                    required
                    disabled={loading}
                />
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
                onClick={handleGoogleLogin}
                disabled={loading}
                className="cursor-pointer flex items-center justify-center w-fit gap-3 px-15 py-3 border border-gray-200 rounded-md bg-white shadow-sm hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {/* <FcGoogle className="text-xl"/> */}
                {loading ? "Signing in..." : "Continue with Google"}
            </button>

            {errorMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-72">
                    {errorMsg}
                </div>
            )}
        </div>
    );
}