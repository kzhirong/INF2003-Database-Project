import { StatsBlock } from "@/types/blocks";

interface StatsBlockRendererProps {
  block: StatsBlock;
}

export default function StatsBlockRenderer({ block }: StatsBlockRendererProps) {
  const { stats, layout = 'horizontal' } = block.config;

  const layoutClasses = layout === 'horizontal'
    ? 'flex flex-wrap justify-center gap-8'
    : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';

  return (
    <div className={layoutClasses}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          {stat.icon && (
            <div className="text-4xl mb-2">{stat.icon}</div>
          )}
          <div className="text-3xl md:text-4xl font-bold text-[#F44336]">
            {stat.value}
          </div>
          <div className="text-sm md:text-base text-gray-600 mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
