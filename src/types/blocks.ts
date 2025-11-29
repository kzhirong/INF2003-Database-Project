// Block type definitions for CCA page builder

export type BlockType =
  | "text"
  | "gallery"
  | "events"
  | "leadership"
  | "achievements"
  | "stats"
  | "cta";

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  config: {
    content: string;
    alignment?: "left" | "center" | "right";
    fontSize?: "small" | "medium" | "large";
  };
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  config: {
    images: string[];
    columns?: 2 | 3 | 4;
    caption?: string;
  };
}

export interface EventItem {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface EventsBlock extends BaseBlock {
  type: "events";
  config: {
    title?: string;
    events: EventItem[];
    layout?: "list" | "grid";
  };
}

export interface LeadershipMember {
  name: string;
  role: string;
  year: string;
  course: string;
  imageUrl?: string;
}

export interface LeadershipBlock extends BaseBlock {
  type: "leadership";
  config: {
    title?: string;
    members: LeadershipMember[];
    layout?: "grid" | "list";
  };
}

export interface AchievementsBlock extends BaseBlock {
  type: "achievements";
  config: {
    title?: string;
    achievements: string[];
    style?: "list" | "badges";
  };
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
}

export interface StatsBlock extends BaseBlock {
  type: "stats";
  config: {
    stats: StatItem[];
    layout?: "horizontal" | "grid";
  };
}

export interface CTABlock extends BaseBlock {
  type: "cta";
  config: {
    title: string;
    description?: string;
    buttonText: string;
    buttonLink?: string;
    backgroundColor?: string;
  };
}

export type Block =
  | TextBlock
  | GalleryBlock
  | EventsBlock
  | LeadershipBlock
  | AchievementsBlock
  | StatsBlock
  | CTABlock;

export interface ScheduleSession {
  day: string;
  startTime: string;  // "18:00" (24-hour format)
  endTime: string;    // "20:00" (24-hour format)
  location: string;   // "Sports Hall, Level 1"
}

export interface CCAPageData {
  // Fixed fields for filtering
  _id: string;
  name: string;
  category: string;
  schedule?: ScheduleSession[];  // Only present for "Schedule Based" commitment
  commitment: string;
  sportType?: string;

  // Hero section (optional)
  heroImage?: string;
  shortDescription?: string;

  // Dynamic content blocks
  blocks?: Block[];

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
