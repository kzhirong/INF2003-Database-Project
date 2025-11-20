import Link from "next/link";

interface NewsCardProps {
  id: string;
  category: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

const NewsCard = ({
  id,
  category,
  title,
  date,
  description,
  image,
}: NewsCardProps) => {
  // Default crossed lines icon if no image is provided
  const defaultIcon = (
    <svg
      className="w-full h-full"
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
  );

  return (
    <Link href={`/news/${id}`} className="block">
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow cursor-pointer">
        {/* Image/Icon Section */}
        <div className="w-full sm:w-[358px] h-[276px] bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full p-12">{defaultIcon}</div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10 flex flex-col justify-center flex-grow">
          {/* Category */}
          <p className="text-[#F44336] text-sm md:text-base font-semibold mb-3 uppercase tracking-wide">
            {category}
          </p>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-black mb-3 leading-tight">
            {title}
          </h3>

          {/* Date */}
          <p className="text-gray-600 text-sm md:text-base mb-4">{date}</p>

          {/* Description */}
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
