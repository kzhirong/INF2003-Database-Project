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

  const handleLinkChange = (link: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, link }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.config.title || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="e.g., Join Our CCA Today!"
          required
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={block.config.link || ""}
          onChange={(e) => handleLinkChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="e.g., /join or https://example.com"
          required
        />
      </div>
    </div>
  );
}
