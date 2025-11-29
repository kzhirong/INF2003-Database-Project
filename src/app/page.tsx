import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] relative overflow-hidden flex flex-col">
      {/* Top Curved Section */}
      <div className="h-6 bg-[#F44336] rounded-b-[4.5rem] min-h-6">&nbsp;</div>

      {/* Main Content */}
      <div className="relative z-10 pt-8 pb-8 px-4 sm:px-8 md:px-16 lg:px-24 flex-grow">
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
                <LoginForm />
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

      {/* Bottom curved section - always at bottom */}
      <div className="h-6 bg-[#F44336] rounded-t-[3.5rem] min-h-6">&nbsp;</div>
    </div>
    
  );
}