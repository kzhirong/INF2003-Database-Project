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
    <div className="space-y-12">
      {sortedBlocks.map((block) => (
        <div key={block.id} className="block-container">
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
