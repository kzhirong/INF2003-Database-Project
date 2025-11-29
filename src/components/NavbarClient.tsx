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
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session and user data
    const getUser = async () => {
      try {
        // First, try to get session from cookies (faster, synchronous-like)
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          // Set user immediately from session to show logout button faster
          setUser(session.user);

          // Try to load cached userData from localStorage to prevent flickering
          const cachedUserData = localStorage.getItem('userData');
          if (cachedUserData) {
            try {
              setUserData(JSON.parse(cachedUserData));
            } catch (e) {
              console.error('Error parsing cached userData:', e);
            }
          }

          // Fetch detailed user data in background
          const data = await getUserData();
          if (!mounted) return;
          setUserData(data);

          // Cache userData in localStorage
          if (data) {
            localStorage.setItem('userData', JSON.stringify(data));
          }
        } else {
          setUser(null);
          setUserData(null);
          localStorage.removeItem('userData');
        }
      } catch (err) {
        console.error('Error getting user:', err);
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

          // Cache userData in localStorage
          if (data) {
            localStorage.setItem('userData', JSON.stringify(data));
          }
        } else {
          setUserData(null);
          localStorage.removeItem('userData');
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    // Immediately clear user state to hide navbar buttons
    setUser(null);
    setUserData(null);
    localStorage.removeItem('userData');

    // Sign out and redirect
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-[#FAFBFD] px-4 sm:px-8 md:px-16 lg:px-24 pt-4 pb-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* SIT Logo and Role Label */}
        <div className="flex items-center gap-4">
          <Image
            src="/assets/SiT.png"
            alt="SIT Logo"
            width={84}
            height={78}
            className="w-12 md:w-16 h-auto"
          />

          {/* Show role label for CCA Admin and System Admin */}
          {userData?.role === "cca_admin" && (
            <span className="text-gray-700 font-semibold text-lg">
              CCA Admin
            </span>
          )}
          {userData?.role === "system_admin" && (
            <span className="text-gray-700 font-semibold text-lg">
              System Admin
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-8 pt-5">
          {/* Navigation Links - Only show for students */}
          {userData?.role === "student" && (
            <div className="hidden md:flex items-center space-x-8 ">
              <Link
                href="/landing"
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                HOME
              </Link>
              <Link
                href="/events"
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                EVENTS
              </Link>
              <Link
                href="/ccas"
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                CCAS
              </Link>
            </div>
          )}

          {/* CCA Admin Navigation */}
          {userData?.role === "cca_admin" && userData.cca_id && (
            <div className="hidden md:flex items-center space-x-6 mr-4">
              <Link
                href={`/cca-admin/${userData.cca_id}`}
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                OVERVIEW
              </Link>
              <Link
                href={`/cca-admin/${userData.cca_id}/members`}
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                MY MEMBERS
              </Link>
              <Link
                href={`/cca-admin/${userData.cca_id}/analytics`}
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                ANALYTICS
              </Link>
              <Link
                href={`/ccas/${userData.cca_id}/edit`}
                className="text-[#000] hover:text-[#F44336] transition-colors duration-200 font-bold font-raleway"
              >
                MANAGE PAGE
              </Link>
            </div>
          )}

          {/* Dashboard & Logout Buttons */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Show user name for students only */}
              {userData?.role === "student" && userData.name && (
                <span className="text-gray-700 font-semibold hidden lg:block">
                  {userData.name}
                </span>
              )}

              {/* Dashboard button - Only show for students */}
              {userData?.role === "student" && (
                <Link href="/dashboard">
                  <button className="bg-[#F44336] hover:bg-[#FF8A80] text-[#FFF] font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
                    {/* Profile Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    DASHBOARD
                  </button>
                </Link>
              )}

              {/* Logout button - Always show when user is authenticated */}
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-[#FFF] font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 cursor-pointer"
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
          )}
        </div>
      </div>
    </nav>
  );
}
