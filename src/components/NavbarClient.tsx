"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getUserData, type UserData } from "@/lib/auth";

export default function NavbarClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Get initial session and user data
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;
        setUser(user);

        if (user) {
          const data = await getUserData();
          if (!mounted) return;
          setUserData(data);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip INITIAL_SESSION and SIGNED_IN during initialization to avoid race condition
      // The main getUser() call handles these cases
      if (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN') {
        return;
      }

      try {
        if (!mounted) return;
        setUser(session?.user ?? null);

        if (session?.user) {
          const data = await getUserData();
          if (!mounted) return;
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-[#FAFBFD] px-4 sm:px-8 md:px-16 lg:px-24 pt-4 pb-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* SIT Logo */}
        <div className="flex items-center">
          <Image
            src="/assets/SiT.png"
            alt="SIT Logo"
            width={84}
            height={78}
            className="w-12 md:w-16 h-auto"
          />
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-8 pt-5">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 ">
            <a
              href="/landing"
              className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
            >
              HOME
            </a>
            <a
              href="/news"
              className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
            >
              NEWS
            </a>
            <a
              href="/ccas"
              className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
            >
              CCAS
            </a>
          </div>

          {/* Dashboard & Logout Buttons */}
          {/* Show loading state or buttons based on session status */}
          {loading ? (
            // Show placeholder buttons while loading to prevent flash
            <div className="flex items-center gap-3">
              <div className="bg-[#F44336] text-[#FFF] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 opacity-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                DASHBOARD
              </div>
              <div className="bg-gray-600 text-[#FFF] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 opacity-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                LOGOUT
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {/* Show user name if available */}
              {userData && (
                <span className="text-gray-700 font-semibold hidden lg:block">
                  {userData.full_name}
                </span>
              )}

              <Link href={
                userData?.role === "system_admin"
                  ? "/admin"
                  : userData?.role === "cca_admin" && userData?.cca_id
                    ? `/cca-admin/${userData.cca_id}`
                    : "/dashboard"
              }>
                <button className="bg-[#F44336] hover:bg-[#FF8A80] text-[#FFF] font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
                  {/* Profile Icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  DASHBOARD
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-[#FFF] font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {/* Logout Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                LOGOUT
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
