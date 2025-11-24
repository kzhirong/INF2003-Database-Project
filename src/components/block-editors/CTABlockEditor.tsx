"use client";

import { CTABlock } from "@/types/blocks";

interface CTABlockEditorProps {
  block: CTABlock;
  onUpdate: (block: CTABlock) => void;
}

export default function CTABlockEditor({ block, onUpdate }: CTABlockEditorProps) {
  const handleTitleChange = (title: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, title }
    });
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, description }
    });
  };

  const handleButtonTextChange = (buttonText: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, buttonText }
    });
  };

  const handleButtonLinkChange = (buttonLink: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, buttonLink }
    });
  };

  const handleBackgroundColorChange = (backgroundColor: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, backgroundColor }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={block.config.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="e.g., Join Our CCA Today!"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={block.config.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="Additional text or call-to-action message"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Text *
          </label>
          <input
            type="text"
            value={block.config.buttonText}
            onChange={(e) => handleButtonTextChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
            placeholder="e.g., Join Now"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Link (Optional)
          </label>
          <input
            type="text"
            value={block.config.buttonLink || ""}
            onChange={(e) => handleButtonLinkChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
            placeholder="e.g., /join"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color (Optional)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={block.config.backgroundColor || ""}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
            placeholder="e.g., #F44336 or red-500"
          />
          <input
            type="color"
            value={block.config.backgroundColor || "#F44336"}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
