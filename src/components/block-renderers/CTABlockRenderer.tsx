import Link from "next/link";
import { CTABlock } from "@/types/blocks";

interface CTABlockRendererProps {
  block: CTABlock;
}

export default function CTABlockRenderer({ block }: CTABlockRendererProps) {
  const { title, description, buttonText, buttonLink, backgroundColor = '#F44336' } = block.config;

  return (
    <div
      className="rounded-lg p-12 text-center text-white"
      style={{ backgroundColor }}
    >
      <h3 className="text-3xl md:text-4xl font-bold mb-4">{title}</h3>

      {description && (
        <p className="text-lg md:text-xl mb-8 opacity-90">{description}</p>
      )}

      {buttonLink ? (
        <Link
          href={buttonLink}
          className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
        >
          {buttonText}
        </Link>
      ) : (
        <button className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
          {buttonText}
        </button>
      )}
    </div>
  );
}
