import Link from "next/link";
import { CTABlock } from "@/types/blocks";

interface CTABlockRendererProps {
  block: CTABlock;
}

export default function CTABlockRenderer({ block }: CTABlockRendererProps) {
  const { title, description, link } = block.config;

  // Format link to handle external URLs
  const formatLink = (url: string) => {
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

      <div className="flex items-start justify-between gap-4">
        {description && (
          <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap flex-grow">{description}</p>
        )}

        {link && (
          <a
            href={formatLink(link)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#F44336] hover:bg-[#D32F2F] text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-md whitespace-nowrap flex-shrink-0"
          >
            Click for Link!
          </a>
        )}
      </div>
    </div>
  );
}
