import Image from "next/image";

interface CCADataSectionProps {
  stats?: {
    number: string;
    label: string;
  }[];
}

const CCADataSection = ({
  stats = [
    { number: "150+", label: "Active CCAs" },
    { number: "2,500", label: "Students Involved" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "100", label:"James"},
    { number: "101", label: "James gay partner"}
  ]
}: CCADataSectionProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* SVG Background */}
        <div className="w-full" style={{ aspectRatio: '886/201' }}>
          <Image
            src="/assets/cca-data-design.svg"
            alt=""
            width={886}
            height={201}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Text Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Main content area positioned over the white rectangle */}
          <div
            className="relative flex items-center justify-center w-full max-w-[83%] px-2 sm:px-6 md:px-8"
            style={{
              top: '5%',
              left: '0%'
            }}
          >
            <div className="flex items-center justify-center" style={{ gap: 'clamp(0.5rem, 4vw, 4rem)' }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center min-w-0">
                  <div className="font-bold text-[#F44336] leading-none mb-1"
                       style={{ fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
                    {stat.number}
                  </div>
                  <div className="text-gray-700 text-xs sm:text-sm leading-none whitespace-nowrap"
                       style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCADataSection;