import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  category?: string;
}

const ServiceCard = ({
  title,
  description,
  icon,
  image,
  imageAlt,
  category
}: ServiceCardProps) => {
  // Default crossed lines icon if no icon is provided
  const defaultIcon = (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
      <svg
        className="absolute inset-0 w-full h-full p-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  const cardContent = (
    <div className="bg-white shadow-sm border border-gray-100 text-center max-w-sm mx-auto hover:shadow-lg transition-shadow cursor-pointer h-full">
      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Fixed size image */}
        {image ? (
          <div className="w-74 h-64 mx-auto mb-6 overflow-hidden">
            <img
              src={image}
              alt={imageAlt || title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-6">
            {icon || defaultIcon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-l md:text-xl font-bold text-[#000] mb-2 leading-tight tracking-wide">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  // If category is provided, wrap in Link to CCA page with category filter
  if (category) {
    return (
      <Link href={`/ccas?category=${encodeURIComponent(category)}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default ServiceCard;