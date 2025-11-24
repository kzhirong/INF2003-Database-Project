"use client";

import { GalleryBlock } from "@/types/blocks";

interface GalleryBlockEditorProps {
  block: GalleryBlock;
  onUpdate: (block: GalleryBlock) => void;
}

export default function GalleryBlockEditor({ block, onUpdate }: GalleryBlockEditorProps) {
  const handleAddImage = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        images: [...block.config.images, ""]
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        images: block.config.images.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpdateImage = (index: number, value: string) => {
    const updatedImages = [...block.config.images];
    updatedImages[index] = value;
    onUpdate({
      ...block,
      config: { ...block.config, images: updatedImages }
    });
  };

  const handleColumnsChange = (columns: 2 | 3 | 4) => {
    onUpdate({
      ...block,
      config: { ...block.config, columns }
    });
  };

  const handleCaptionChange = (caption: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, caption }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Columns
          </label>
          <div className="flex gap-2">
            {([2, 3, 4] as const).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => handleColumnsChange(col)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  block.config.columns === col
                    ? "bg-[#F44336] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Caption (Optional)
        </label>
        <input
          type="text"
          value={block.config.caption || ""}
          onChange={(e) => handleCaptionChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="Gallery caption..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images
        </label>
        <div className="space-y-3">
          {block.config.images.map((image, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={image}
                onChange={(e) => handleUpdateImage(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                placeholder="/uploads/image.jpg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImage}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            + Add Image
          </button>
        </div>
      </div>
    </div>
  );
}
