"use client";

import { useState } from "react";
import { Block, BlockType } from "@/types/blocks";
import TextBlockEditor from "./block-editors/TextBlockEditor";
import GalleryBlockEditor from "./block-editors/GalleryBlockEditor";
import EventsBlockEditor from "./block-editors/EventsBlockEditor";
import LeadershipBlockEditor from "./block-editors/LeadershipBlockEditor";
import AchievementsBlockEditor from "./block-editors/AchievementsBlockEditor";
import StatsBlockEditor from "./block-editors/StatsBlockEditor";
import CTABlockEditor from "./block-editors/CTABlockEditor";

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

export default function BlockEditor({ blocks, onBlocksChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const blockTypeLabels: Record<BlockType, string> = {
    text: "Text Block",
    gallery: "Gallery Block",
    events: "Events Block",
    leadership: "Leadership Block",
    achievements: "Achievements Block",
    stats: "Stats Block",
    cta: "Call-to-Action Block"
  };

  const createNewBlock = (type: BlockType): Block => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const order = blocks.length;

    switch (type) {
      case "text":
        return {
          id,
          type: "text",
          order,
          config: {
            content: "",
            alignment: "left",
            fontSize: "medium"
          }
        };
      case "gallery":
        return {
          id,
          type: "gallery",
          order,
          config: {
            images: [],
            columns: 3
          }
        };
      case "events":
        return {
          id,
          type: "events",
          order,
          config: {
            events: [],
            layout: "grid"
          }
        };
      case "leadership":
        return {
          id,
          type: "leadership",
          order,
          config: {
            members: [],
            layout: "grid"
          }
        };
      case "achievements":
        return {
          id,
          type: "achievements",
          order,
          config: {
            achievements: [],
            style: "list"
          }
        };
      case "stats":
        return {
          id,
          type: "stats",
          order,
          config: {
            stats: [],
            layout: "horizontal"
          }
        };
      case "cta":
        return {
          id,
          type: "cta",
          order,
          config: {
            title: "",
            buttonText: "Join Now"
          }
        };
    }
  };

  const handleAddBlock = (type: BlockType) => {
    const newBlock = createNewBlock(type);
    onBlocksChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const handleUpdateBlock = (updatedBlock: Block) => {
    onBlocksChange(
      blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block))
    );
  };

  const handleRemoveBlock = (blockId: string) => {
    const updatedBlocks = blocks
      .filter((block) => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index }));
    onBlocksChange(updatedBlocks);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    const reordered = newBlocks.map((block, i) => ({ ...block, order: i }));
    onBlocksChange(reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    const reordered = newBlocks.map((block, i) => ({ ...block, order: i }));
    onBlocksChange(reordered);
  };

  const renderBlockEditor = (block: Block) => {
    switch (block.type) {
      case "text":
        return <TextBlockEditor block={block} onUpdate={handleUpdateBlock} />;
      case "gallery":
        return <GalleryBlockEditor block={block} onUpdate={handleUpdateBlock} />;
      case "events":
        return <EventsBlockEditor block={block} onUpdate={handleUpdateBlock} />;
      case "leadership":
        return <LeadershipBlockEditor block={block} onUpdate={handleUpdateBlock} />;
      case "achievements":
        return <AchievementsBlockEditor block={block} onUpdate={handleUpdateBlock} />;
      case "stats":
        return <StatsBlockEditor block={block} onUpdate={handleUpdateBlock} />;
      case "cta":
        return <CTABlockEditor block={block} onUpdate={handleUpdateBlock} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Block Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full px-6 py-4 bg-[#F44336] text-white rounded-lg font-semibold hover:bg-[#D32F2F] transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span>
          <span>Add Section</span>
        </button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
            {(Object.keys(blockTypeLabels) as BlockType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleAddBlock(type)}
                className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{blockTypeLabels[type]}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Block List */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No sections added yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Section" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Block Header */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="opacity-50"
                    >
                      <circle cx="7" cy="5" r="1.5" />
                      <circle cx="13" cy="5" r="1.5" />
                      <circle cx="7" cy="10" r="1.5" />
                      <circle cx="13" cy="10" r="1.5" />
                      <circle cx="7" cy="15" r="1.5" />
                      <circle cx="13" cy="15" r="1.5" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                    {blockTypeLabels[block.type]}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Move Up */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      index === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Move up"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 15 L10 5 M10 5 L6 9 M10 5 L14 9" />
                    </svg>
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === blocks.length - 1}
                    className={`p-2 rounded-lg transition-colors ${
                      index === blocks.length - 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Move down"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 5 L10 15 M10 15 L6 11 M10 15 L14 11" />
                    </svg>
                  </button>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(block.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove section"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 6 L14 14 M14 6 L6 14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Block Content Editor */}
              <div className="p-6">{renderBlockEditor(block)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
