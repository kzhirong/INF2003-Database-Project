// Block type definitions for CCA page builder

export type BlockType =
  | "text"
  | "gallery"
  | "cta";

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type: "text";
  config: {
    title: string;
    description: string;
  };
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  config: {
    title: string;
    description?: string;
    images: string[];
    gridView?: 1 | 2 | 3 | 4;
  };
}

export interface CTABlock extends BaseBlock {
  type: "cta";
  config: {
    title: string;
    description?: string;
    link: string;
  };
}

export type Block =
  | TextBlock
  | GalleryBlock
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
