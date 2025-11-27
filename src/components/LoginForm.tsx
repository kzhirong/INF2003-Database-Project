"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserData } from "@/lib/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Successfully logged in - check user role and redirect accordingly
        const userData = await getUserData();

        // Debug logging
        console.log("User data:", userData);
        console.log("Role:", userData?.role);
        console.log("CCA ID:", userData?.cca_id);

        if (userData?.role === "system_admin") {
          // System admin - redirect to admin dashboard
          console.log("Redirecting to /admin");
          router.push("/admin");
        } else if (userData?.role === "cca_admin" && userData.cca_id) {
          // CCA admin - redirect to their CCA admin dashboard
          console.log("Redirecting to /cca-admin/" + userData.cca_id);
          router.push(`/cca-admin/${userData.cca_id}`);
        } else {
          // Student - redirect to dashboard
          console.log("Redirecting to /dashboard");
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[#000] text-base md:text-lg mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@gmail.com"
          required
          className="w-full px-4 md:px-5 py-3 md:py-4 bg-[#FFF6F4] border-none rounded-lg text-[#000] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336] text-sm md:text-base"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="text-[#000] text-base md:text-lg">
            Password
          </label>
          <a href="#" className="text-gray-400 text-xs md:text-sm hover:text-[#F44336]">
            Forgot Password ?
          </a>
        </div>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          required
          className="w-full px-4 md:px-5 py-3 md:py-4 bg-[#FFF6F4] border-none rounded-lg text-[#000] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336] text-sm md:text-base"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#F44336] hover:bg-[#FF8A80] text-[#FFF] hover:text-[#FFF] font-semibold py-2 md:py-3 px-6 md:px-8 rounded-full transition-colors duration-200 flex items-center gap-2 text-sm md:text-base mt-6 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "SIGNING IN..." : "SIGN IN"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  );
}
