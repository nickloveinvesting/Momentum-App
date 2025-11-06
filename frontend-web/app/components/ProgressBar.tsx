/**
 * ProgressBar Component for Onboarding Flow
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {current} of {total}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary-900 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
