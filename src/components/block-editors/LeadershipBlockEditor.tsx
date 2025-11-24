"use client";

import { LeadershipBlock, LeadershipMember } from "@/types/blocks";

interface LeadershipBlockEditorProps {
  block: LeadershipBlock;
  onUpdate: (block: LeadershipBlock) => void;
}

export default function LeadershipBlockEditor({ block, onUpdate }: LeadershipBlockEditorProps) {
  const handleTitleChange = (title: string) => {
    onUpdate({
      ...block,
      config: { ...block.config, title }
    });
  };

  const handleLayoutChange = (layout: "grid" | "list") => {
    onUpdate({
      ...block,
      config: { ...block.config, layout }
    });
  };

  const handleAddMember = () => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        members: [
          ...block.config.members,
          { name: "", role: "", year: "", course: "", imageUrl: "" }
        ]
      }
    });
  };

  const handleRemoveMember = (index: number) => {
    onUpdate({
      ...block,
      config: {
        ...block.config,
        members: block.config.members.filter((_, i) => i !== index)
      }
    });
  };

  const handleUpdateMember = (index: number, field: keyof LeadershipMember, value: string) => {
    const updatedMembers = [...block.config.members];
    updatedMembers[index][field] = value;
    onUpdate({
      ...block,
      config: { ...block.config, members: updatedMembers }
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
            placeholder="e.g., Leadership Team"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <div className="flex gap-2">
            {(["grid", "list"] as const).map((layout) => (
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Members
        </label>
        <div className="space-y-4">
          {block.config.members.map((member, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">Member {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleUpdateMember(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => handleUpdateMember(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                    placeholder="e.g., Captain"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                  <input
                    type="text"
                    value={member.year}
                    onChange={(e) => handleUpdateMember(index, 'year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                    placeholder="e.g., Year 3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
                  <input
                    type="text"
                    value={member.course}
                    onChange={(e) => handleUpdateMember(index, 'course', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={member.imageUrl || ""}
                  onChange={(e) => handleUpdateMember(index, 'imageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F44336] focus:border-transparent text-sm"
                  placeholder="/uploads/member.jpg"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMember}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            + Add Member
          </button>
        </div>
      </div>
    </div>
  );
}
