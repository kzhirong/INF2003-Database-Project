import { AchievementsBlock } from "@/types/blocks";

interface AchievementsBlockRendererProps {
  block: AchievementsBlock;
}

export default function AchievementsBlockRenderer({ block }: AchievementsBlockRendererProps) {
  const { title, achievements, style = 'list' } = block.config;

  return (
    <div>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      )}

      {style === 'list' ? (
        <ul className="space-y-3">
          {achievements.map((achievement, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#F44336] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{achievement}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-wrap gap-3">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-[#F44336] text-white px-6 py-3 rounded-full font-semibold shadow-md">
              {achievement}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
