import { Block } from "@/types/blocks";
import TextBlockRenderer from "./block-renderers/TextBlockRenderer";
import GalleryBlockRenderer from "./block-renderers/GalleryBlockRenderer";
import EventsBlockRenderer from "./block-renderers/EventsBlockRenderer";
import LeadershipBlockRenderer from "./block-renderers/LeadershipBlockRenderer";
import AchievementsBlockRenderer from "./block-renderers/AchievementsBlockRenderer";
import StatsBlockRenderer from "./block-renderers/StatsBlockRenderer";
import CTABlockRenderer from "./block-renderers/CTABlockRenderer";

interface BlockRendererProps {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {sortedBlocks.map((block) => (
        <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Block Title and Description - Show for all block types except CTA */}
          {block.type !== 'cta' && (
            <div className={block.type === 'text' || block.type === 'gallery' ? '' : 'mb-6'}>
              {/* @ts-ignore - title exists on all block types */}
              {block.config.title && (
                <h2 className="text-xl font-bold text-gray-900 mb-2">{block.config.title}</h2>
              )}
              {/* @ts-ignore - description exists on all block types */}
              {block.config.description && (
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap">{block.config.description}</p>
              )}
            </div>
          )}

          {block.type === 'text' && <TextBlockRenderer block={block} />}
          {block.type === 'gallery' && <GalleryBlockRenderer block={block} />}
          {block.type === 'events' && <EventsBlockRenderer block={block} />}
          {block.type === 'leadership' && <LeadershipBlockRenderer block={block} />}
          {block.type === 'achievements' && <AchievementsBlockRenderer block={block} />}
          {block.type === 'stats' && <StatsBlockRenderer block={block} />}
          {block.type === 'cta' && <CTABlockRenderer block={block} />}
        </div>
      ))}
    </div>
  );
}
