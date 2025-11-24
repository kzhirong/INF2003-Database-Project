"use client";

import { TextBlock } from "@/types/blocks";

interface TextBlockEditorProps {
  block: TextBlock;
  onUpdate: (block: TextBlock) => void;
}

export default function TextBlockEditor({ block, onUpdate }: TextBlockEditorProps) {
  const handleContentChange = (content: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, content }
    });
  };

  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    onUpdate({
      ...block,
      config: { ...block.config, alignment }
    });
  };

  const handleFontSizeChange = (fontSize: "small" | "medium" | "large") => {
    onUpdate({
      ...block,
      config: { ...block.config, fontSize }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alignment
          </label>
          <div className="flex gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => handleAlignmentChange(align)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  block.config.alignment === align
                    ? "bg-[#F44336] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleFontSizeChange(size)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  block.config.fontSize === size
                    ? "bg-[#F44336] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={block.config.content}
          onChange={(e) => handleContentChange(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="Enter your text content here..."
        />
      </div>
    </div>
  );
}
