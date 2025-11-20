import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
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
              href="/"
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

          {/* Dashboard Button */}
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
        </div>
      </div>
    </nav>
  );
}