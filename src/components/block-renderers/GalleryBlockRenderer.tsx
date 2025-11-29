import { GalleryBlock } from "@/types/blocks";

interface GalleryBlockRendererProps {
  block: GalleryBlock;
}

export default function GalleryBlockRenderer({ block }: GalleryBlockRendererProps) {
  const { images, gridView = 1 } = block.config;

  return (
    <div>
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${gridView}, 1fr)`
        }}
      >
        {images.map((image, index) => (
          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
