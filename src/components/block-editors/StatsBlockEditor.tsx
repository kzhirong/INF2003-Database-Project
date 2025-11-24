"use client";

import { StatsBlock, StatItem } from "@/types/blocks";

interface StatsBlockEditorProps {
  block: StatsBlock;
  onUpdate: (block: StatsBlock) => void;
}

export default function StatsBlockEditor({ block, onUpdate }: StatsBlockEditorProps) {
  const handleLayoutChange = (layout: "horizontal" | "grid") => {
    onUpdate({
      ...block,
      config: { ...block.config, layout }
    });
  };

  const handleAddStat = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        stats: [...block.config.stats, { label: "", value: "", icon: "" }]
      }
    });
  };

  const handleRemoveStat = (index: number) => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        stats: block.config.stats.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpdateStat = (index: number, field: keyof StatItem, value: string | number) => {
    const updatedStats = [...block.config.stats];
    updatedStats[index][field] = value as any;
    onUpdate({
      ...block,
      config: { ...block.config, stats: updatedStats }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout
        </label>
        <div className="flex gap-2">
          {(["horizontal", "grid"] as const).map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => handleLayoutChange(layout)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                block.config.layout === layout
                  ? "bg-[#F44336] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Statistics
        </label>
        <div className="space-y-4">
          {block.config.stats.map((stat, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">Stat {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveStat(index)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                    placeholder="e.g., Members"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleUpdateStat(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                    placeholder="e.g., 24"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Icon (Optional)</label>
                  <input
                    type="text"
                    value={stat.icon || ""}
                    onChange={(e) => handleUpdateStat(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                    placeholder="e.g., 👥"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddStat}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            + Add Stat
          </button>
        </div>
      </div>
    </div>
  );
}
