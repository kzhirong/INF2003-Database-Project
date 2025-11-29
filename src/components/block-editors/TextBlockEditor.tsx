"use client";

import { TextBlock } from "@/types/blocks";

interface TextBlockEditorProps {
  block: TextBlock;
  onUpdate: (block: TextBlock) => void;
}

export default function TextBlockEditor({ block, onUpdate }: TextBlockEditorProps) {
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
          placeholder="Enter title..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={block.config.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
          placeholder="Enter description..."
          required
        />
      </div>
    </div>
  );
}
