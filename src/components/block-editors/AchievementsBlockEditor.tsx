"use client";

import { AchievementsBlock } from "@/types/blocks";

interface AchievementsBlockEditorProps {
  block: AchievementsBlock;
  onUpdate: (block: AchievementsBlock) => void;
}

export default function AchievementsBlockEditor({ block, onUpdate }: AchievementsBlockEditorProps) {
  const handleTitleChange = (title: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, title }
    });
  };

  const handleStyleChange = (style: "list" | "badges") => {
    onUpdate({
      ...block,
      config: { ...block.config, style }
    });
  };

  const handleAddAchievement = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        achievements: [...block.config.achievements, ""]
      }
    });
  };

  const handleRemoveAchievement = (index: number) => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        achievements: block.config.achievements.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpdateAchievement = (index: number, value: string) => {
    const updatedAchievements = [...block.config.achievements];
    updatedAchievements[index] = value;
    onUpdate({
      ...block,
      config: { ...block.config, achievements: updatedAchievements }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title (Optional)
          </label>
          <input
            type="text"
            value={block.config.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
            placeholder="e.g., Our Achievements"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <div className="flex gap-2">
            {(["list", "badges"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => handleStyleChange(style)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  block.config.style === style
                    ? "bg-[#F44336] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Achievements
        </label>
        <div className="space-y-3">
          {block.config.achievements.map((achievement, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={achievement}
                onChange={(e) => handleUpdateAchievement(index, e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                placeholder="e.g., IVP Championship 2023 - Champions"
              />
              <button
                type="button"
                onClick={() => handleRemoveAchievement(index)}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAchievement}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            + Add Achievement
          </button>
        </div>
      </div>
    </div>
  );
}
