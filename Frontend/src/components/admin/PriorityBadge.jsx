/**
 * Priority Badge Component
 * 
 * Displays priority level with color-coding and icons
 * Used in request lists, dashboards, and detailed views
 * 
 * Props:
 * - score: Priority score (0-255)
 * - category: Priority category (CRITICAL, HIGH, MEDIUM, LOW)
 * - showScore: Whether to show numeric score (default: true)
 * - size: Size variant (small, medium, large) - default: medium
 * - clickable: Whether badge is clickable/interactive (default: false)
 * - onClick: Callback when clicked
 */

import React from 'react';
import PropTypes from 'prop-types';

const PriorityBadge = ({
  score = 50,
  category = 'MEDIUM',
  showScore = true,
  size = 'medium',
  clickable = false,
  onClick = null,
  className = '',
  showLabel = true,
  showIcon = true
}) => {
  // Ensure score is a number
  const safeScore = typeof score === 'object' ? (score?.score || 50) : (score || 50);
  
  // Ensure category is a string
  const safeCategory = typeof category === 'string' ? category : 'MEDIUM';
  // Color and icon mapping for each priority level
  const priorityConfig = {
    CRITICAL: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-900',
      borderColor: 'border-red-300',
      icon: '🔴',
      emoji: '⚠️',
      label: 'Critical',
      bgDark: 'dark:bg-red-900',
      textDark: 'dark:text-red-100',
      pulse: 'animate-pulse',
      badge: 'badge-critical'
    },
    HIGH: {
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-900',
      borderColor: 'border-orange-300',
      icon: '🟠',
      emoji: '🔥',
      label: 'High',
      bgDark: 'dark:bg-orange-900',
      textDark: 'dark:text-orange-100',
      pulse: '',
      badge: 'badge-high'
    },
    MEDIUM: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-900',
      borderColor: 'border-yellow-300',
      icon: '🟡',
      emoji: '⏳',
      label: 'Medium',
      bgDark: 'dark:bg-yellow-900',
      textDark: 'dark:text-yellow-100',
      pulse: '',
      badge: 'badge-medium'
    },
    LOW: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-900',
      borderColor: 'border-green-300',
      icon: '🟢',
      emoji: '✅',
      label: 'Low',
      bgDark: 'dark:bg-green-900',
      textDark: 'dark:text-green-100',
      pulse: '',
      badge: 'badge-low'
    }
  };

  // Size configuration
  const sizeConfig = {
    small: {
      padding: 'px-2 py-1',
      fontSize: 'text-xs',
      icon: 'text-sm'
    },
    medium: {
      padding: 'px-3 py-1.5',
      fontSize: 'text-sm',
      icon: 'text-base'
    },
    large: {
      padding: 'px-4 py-2',
      fontSize: 'text-base',
      icon: 'text-lg'
    }
  };

  const config = priorityConfig[safeCategory] || priorityConfig.MEDIUM;
  const sizeClass = sizeConfig[size] || sizeConfig.medium;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5
        rounded-full border
        ${sizeClass.padding}
        ${config.bgColor} ${config.bgDark}
        ${config.textColor} ${config.textDark}
        ${config.borderColor}
        font-semibold
        ${sizeClass.fontSize}
        ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${config.pulse}
        ${className}
      `}
      onClick={onClick}
      role={clickable ? 'button' : 'status'}
      aria-label={`Priority: ${safeCategory} - Score: ${safeScore}`}
      title={`Priority Score: ${safeScore}/255`}
    >
      {/* Icon */}
      {showIcon && (
        <span className={sizeClass.icon}>
          {safeCategory === 'CRITICAL' ? config.emoji : config.icon}
        </span>
      )}

      {/* Label */}
      {showLabel && <span>{config.label}</span>}

      {/* Score */}
      {showScore && (
        <span className="text-xs opacity-75">
          ({safeScore})
        </span>
      )}
    </div>
  );
};

PriorityBadge.propTypes = {
  score: PropTypes.number,
  category: PropTypes.oneOf(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  showScore: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  showLabel: PropTypes.bool,
  showIcon: PropTypes.bool
};

export default PriorityBadge;

/**
 * Priority Info Component
 * Shows detailed priority information
 */
export const PriorityInfo = ({ priorityData, compact = false }) => {
  if (!priorityData) {
    return <div className="text-gray-500">No priority data</div>;
  }

  const { score, category, breakdown, calculatedAt, actionRequired } = priorityData;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <PriorityBadge score={score} category={category} size="small" />
        <span className="text-xs text-gray-600">
          {new Date(calculatedAt).toLocaleTimeString()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      {/* Header with badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Priority Details</h3>
        <PriorityBadge score={score} category={category} size="medium" />
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Priority Score</span>
          <span className="text-2xl font-bold">{score}/255</span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              category === 'CRITICAL' ? 'bg-red-500' :
              category === 'HIGH' ? 'bg-orange-500' :
              category === 'MEDIUM' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${(score / 255) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
          <h4 className="text-sm font-semibold mb-2">Score Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Urgency:</span>
              <span className="font-medium">{breakdown.urgencyScore || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Blood Rarity:</span>
              <span className="font-medium">{breakdown.rarityScore || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Time Factor:</span>
              <span className="font-medium">{breakdown.timeScore || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Availability:</span>
              <span className="font-medium">{breakdown.availabilityScore || 0} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Required */}
      {actionRequired && (
        <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded p-2 text-sm text-amber-800 dark:text-amber-100">
          ⚡ {actionRequired}
        </div>
      )}

      {/* Calculated time */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Calculated: {new Date(calculatedAt).toLocaleString()}
      </div>
    </div>
  );
};

/**
 * Priority Legend Component
 * Shows what each priority level means
 */
export const PriorityLegend = () => {
  const levels = [
    {
      category: 'CRITICAL',
      description: 'Immediate action required',
      responseTime: '< 15 minutes',
      examples: 'Life-threatening conditions, massive bleeding'
    },
    {
      category: 'HIGH',
      description: 'Urgent attention needed',
      responseTime: '15-45 minutes',
      examples: 'Severe patient condition, rare blood type in low stock'
    },
    {
      category: 'MEDIUM',
      description: 'Standard priority',
      responseTime: '45 minutes - 2 hours',
      examples: 'Regular surgical procedures, planned transfusions'
    },
    {
      category: 'LOW',
      description: 'Can be scheduled',
      responseTime: '2+ hours',
      examples: 'Non-urgent transfusions, sufficient blood available'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Priority Levels</h3>
      <div className="space-y-3">
        {levels.map(level => (
          <div key={level.category} className="border-l-4 pl-3" style={{
            borderColor: level.category === 'CRITICAL' ? '#ef4444' :
                        level.category === 'HIGH' ? '#f97316' :
                        level.category === 'MEDIUM' ? '#eab308' :
                        '#22c55e'
          }}>
            <div className="flex items-center gap-2 mb-1">
              <PriorityBadge category={level.category} showScore={false} size="small" />
              <span className="text-sm font-semibold">{level.description}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Response Time: <span className="font-medium">{level.responseTime}</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Examples: {level.examples}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
