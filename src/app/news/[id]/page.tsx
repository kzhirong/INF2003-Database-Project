import NavbarClient from "@/components/NavbarClient";

export default function NewsDetail() {
  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Navigation Bar */}
      <NavbarClient />

      {/* Main Content */}
      <main className="py-8">
        {/* Breadcrumb */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          <p className="text-sm md:text-base text-gray-600">
            <span className="text-black font-medium">HOME</span>
            <span className="mx-2">|</span>
            <span className="text-black font-medium">NEWS</span>
            <span className="mx-2">|</span>
            <span className="text-[#F44336] font-semibold">RUN WITH RUN CLUB</span>
          </p>
        </div>

        {/* Content Section */}
        <section>
          {/* Photo Section - Full Width */}
          <div className="bg-[#F5F5F5] w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center mb-12">
            {/* Default crossed lines icon */}
            <svg
              className="w-full h-full p-16"
              viewBox="0 0 358 276"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L357 275M357 1L1 275"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Article Content - Full Width */}
          <div className="bg-white p-8 md:p-12 lg:p-16 mb-8">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F44336] mb-8">
              Run With Run Club
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-black leading-relaxed mb-12">
              An annual event for all SITizens. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
            </p>

            {/* Important Information Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F44336] mb-6">
                Important Information
              </h2>
              <p className="text-base md:text-lg text-black leading-relaxed">
                Monday, 6PM @ Sports Hall
              </p>
            </div>

            {/* Join Us Section */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F44336] mb-6">
                Join Us
              </h2>
              <p className="text-base md:text-lg text-black leading-relaxed">
                Register{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Here
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
