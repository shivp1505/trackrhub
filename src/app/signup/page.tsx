"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";
import { setDoc, doc } from "firebase/firestore";
import Link from "next/link";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store additional info in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#E5E5E5] flex flex-col items-center justify-center p-6">
      <h1 className="text-[60px] font-bold text-black mb-8">Create Your TrackrHub Account</h1>

      <form
        onSubmit={handleSignUp}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        {/* Name Field */}
        <input
          type="text"
          placeholder="Full Name"
          className="p-3 border border-gray-400 rounded-md text-[18px] text-black placeholder-gray-600"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email Field */}
        <input
          type="email"
          placeholder="Email"
          className="p-3 border border-gray-400 rounded-md text-[18px] text-black placeholder-gray-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Field */}
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-400 rounded-md text-[18px] text-black placeholder-gray-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-[#4B4B4B] text-white font-bold text-[24px] py-2 rounded-md hover:bg-[#3a3a3a] transition"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-black text-[16px]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold hover:underline">
          Login
        </Link>
      </p>
    </main>
  );
}
