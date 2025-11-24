import { TextBlock } from "@/types/blocks";

interface TextBlockRendererProps {
  block: TextBlock;
}

export default function TextBlockRenderer({ block }: TextBlockRendererProps) {
  const { content, alignment = 'left', fontSize = 'medium' } = block.config;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const fontSizeClasses = {
    small: 'text-sm md:text-base',
    medium: 'text-base md:text-lg',
    large: 'text-lg md:text-xl lg:text-2xl'
  };

  return (
    <div className={`${alignmentClasses[alignment]} ${fontSizeClasses[fontSize]} text-gray-700 leading-relaxed whitespace-pre-wrap`}>
      {content}
    </div>
  );
}
