import Link from "next/link";

interface CCACardProps {
  title: string;
  category: string;
  memberStatus: string;
  upcomingEvent: string;
  image?: string;
  id?: string;
}

const CCACard = ({
  title,
  category,
  memberStatus,
  upcomingEvent,
  image,
  id,
}: CCACardProps) => {
  // Default crossed lines icon if no image is provided
  const defaultIcon = (
    <svg
      className="w-full h-full"
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 20L180 130M180 20L20 130"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const cardContent = (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Image/Icon Section */}
      <div className="w-full h-[150px] bg-[#F5F5F5] flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full p-8">{defaultIcon}</div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-black mb-2 uppercase">
          {title}
        </h3>

        {/* Category and Member Status */}
        <p className="text-sm text-gray-600 mb-1">
          {category} | {memberStatus}
        </p>

        {/* Upcoming Event */}
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Upcoming:</span> {upcomingEvent}
        </p>
      </div>
    </div>
  );

  // If id is provided, wrap in Link, otherwise return as is
  if (id) {
    return (
      <Link href={`/ccas/${id}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default CCACard;
