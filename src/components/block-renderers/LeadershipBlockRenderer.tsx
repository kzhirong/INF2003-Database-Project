import { LeadershipBlock } from "@/types/blocks";

interface LeadershipBlockRendererProps {
  block: LeadershipBlock;
}

export default function LeadershipBlockRenderer({ block }: LeadershipBlockRendererProps) {
  const { title, members, layout = 'grid' } = block.config;

  const layoutClasses = layout === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      )}

      <div className={layoutClasses}>
        {members.map((member, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
            {member.imageUrl ? (
              <img
                src={member.imageUrl}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center text-gray-500 text-2xl font-bold">
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}

            <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
            <p className="text-[#F44336] font-semibold mb-2">{member.role}</p>
            <p className="text-sm text-gray-600">{member.year}</p>
            <p className="text-sm text-gray-600">{member.course}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
