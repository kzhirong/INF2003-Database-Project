import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] relative overflow-hidden">
      {/* Top Curved Section */}
      <div className="absolute top-0 left-0 w-full border">
        <Image
          src="/assets/top-curved-section.svg"
          alt=""
          width={1152}
          height={23}
          className="w-full h-auto"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-8 pb-8 px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center min-h-[calc(100vh-160px)]">

            {/* Left Side - Login Form */}
            <div className="space-y-6 md:space-y-8 w-full">
              {/* SIT Logo */}
              <div className="mb-18">
                <Image
                  src="/assets/SiT.png"
                  alt="SIT Logo"
                  width={84}
                  height={78}
                  className="w-16 md:w-25 h-auto"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#000] leading-tight">
                Welcome Back!
              </h1>

              <div className="bg-[#FFF] p-6 md:p-8 rounded-2xl max-w-xl w-full">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-[#000] text-base md:text-lg mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="test@gmail.com"
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
                      placeholder="••••••••••••"
                      className="w-full px-4 md:px-5 py-3 md:py-4 bg-[#FFF6F4] border-none rounded-lg text-[#000] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336] text-sm md:text-base"
                    />
                  </div>

                  <button className="bg-[#F44336] hover:bg-[#FF8A80] text-[#FFF] hover:text-[#FFF] font-semibold py-2 md:py-3 px-6 md:px-8 rounded-full transition-colors duration-200 flex items-center gap-2 text-sm md:text-base mt-6 w-full justify-center">
                    SIGN IN
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Character Illustrations */}
            <div className="relative hidden lg:flex justify-center items-center h-full">
              <Image
                src="/assets/welcome-icons.svg"
                alt="Welcome characters"
                width={600}
                height={400}
                className="w-full max-w-md h-auto"
              />
            </div>

            {/* Mobile Character Illustrations - Show on smaller screens */}
            <div className="flex lg:hidden justify-center items-center mt-8">
              <Image
                src="/assets/welcome-icons.svg"
                alt="Welcome characters"
                width={600}
                height={400}
                className="w-full max-w-xs h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Curved Section */}
      <div className="absolute bottom-0 left-0 w-full border">
        <Image
          src="/assets/bottom-curved-section.svg"
          alt=""
          width={1152}
          height={23}
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
