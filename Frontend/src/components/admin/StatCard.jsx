import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  borderColor = 'border-red-600',
  trend,
  trendColor = 'text-green-600',
  description,
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-t-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-600 text-sm font-semibold">{title}</p>
        {Icon && <Icon className={borderColor.replace('border-', 'text-')} size={24} />}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={trendColor}>{trend}</span>
        </div>
      )}
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}
