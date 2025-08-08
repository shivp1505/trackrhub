"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Invalid email or password");
    }
  };

  return (
    <main className="min-h-screen bg-[#E5E5E5] flex flex-col items-center justify-center p-6">
      {/* Title */}
      <h1 className="text-[70px] font-bold text-black mb-8">
        Sign in to TrackrHub
      </h1>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        {/* Email Field */}
        <input
          type="email"
          placeholder="Email"
          className="p-3 border border-gray-400 rounded-md text-[18px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"

          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Field */}
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-400 rounded-md text-[18px] text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"

          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Login Button */}
        <button
          type="submit"
          className="bg-[#4B4B4B] text-white font-bold text-[24px] py-2 rounded-md hover:bg-[#3a3a3a] transition"
        >
          Login
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-6 text-black text-[16px]">
        Don’t have an account?{" "}
        <Link href="/signup" className="font-bold hover:underline">
          Sign Up
        </Link>
      </p>
    </main>
  );
}
