/**
 * RangeMap Component
 * Canvas-based visualization of comfort zone expansion
 */

'use client';

import React, { useEffect, useRef } from 'react';
import type { RangeMap as RangeMapType, AvoidanceZone } from '@momentum/shared';
import { cn, getZoneHexColor, getZoneLabel } from '@/lib/utils';
import { INITIAL_RANGE_RADIUS } from '@momentum/shared';

interface RangeMapProps {
  rangeMap: RangeMapType;
  showComparison?: boolean; // Show Day 1 vs Today
  animated?: boolean;
  className?: string;
}

export default function RangeMap({
  rangeMap,
  showComparison = false,
  animated = true,
  className,
}: RangeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size / 2 - 40; // Leave margin for labels

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background grid (optional)
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let r = 50; r <= maxRadius; r += 50) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, size - 20);
    ctx.moveTo(20, centerY);
    ctx.lineTo(size - 20, centerY);
    ctx.stroke();

    // Calculate normalized radii (scale to fit canvas)
    const maxValue = Math.max(
      rangeMap.currentRadius.social,
      rangeMap.currentRadius.physical,
      rangeMap.currentRadius.professional,
      rangeMap.currentRadius.emotional,
      INITIAL_RANGE_RADIUS
    );

    const scale = maxRadius / maxValue;

    // Zone configuration
    const zones: Array<{
      key: AvoidanceZone;
      angle: number;
      label: string;
    }> = [
      { key: 'social', angle: 0, label: 'Social' }, // Right
      { key: 'physical', angle: Math.PI / 2, label: 'Physical' }, // Down
      { key: 'professional', angle: Math.PI, label: 'Professional' }, // Left
      { key: 'emotional', angle: (3 * Math.PI) / 2, label: 'Emotional' }, // Up
    ];

    // Draw starting range (Day 1) if comparison mode
    if (showComparison) {
      const startRadius = rangeMap.startRadius * scale;

      ctx.fillStyle = 'rgba(156, 163, 175, 0.2)'; // Gray
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, startRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Day 1', centerX, centerY + startRadius + 20);
    }

    // Draw current range (polygon connecting zone radii)
    const points: Array<{ x: number; y: number }> = [];

    zones.forEach((zone) => {
      const radius = rangeMap.currentRadius[zone.key] * scale;
      const x = centerX + Math.cos(zone.angle) * radius;
      const y = centerY + Math.sin(zone.angle) * radius;
      points.push({ x, y });
    });

    // Draw filled polygon
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
    gradient.addColorStop(0, 'rgba(26, 54, 93, 0.1)');
    gradient.addColorStop(1, 'rgba(26, 54, 93, 0.3)');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#1a365d';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw zone segments with colors
    zones.forEach((zone) => {
      const radius = rangeMap.currentRadius[zone.key] * scale;

      const x1 = centerX + Math.cos(zone.angle) * radius;
      const y1 = centerY + Math.sin(zone.angle) * radius;

      // Draw arc segment
      const color = getZoneHexColor(zone.key);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Draw zone indicator
      const indicatorRadius = 8;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x1, y1, indicatorRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw inner white circle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x1, y1, indicatorRadius - 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw labels
      const labelDistance = radius + 30;
      const labelX = centerX + Math.cos(zone.angle) * labelDistance;
      const labelY = centerY + Math.sin(zone.angle) * labelDistance;

      ctx.fillStyle = color;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.label, labelX, labelY);

      // Draw radius value
      ctx.fillStyle = '#374151';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(
        Math.round(rangeMap.currentRadius[zone.key]).toString(),
        labelX,
        labelY + 16
      );
    });

    // Draw center point
    ctx.fillStyle = '#1a365d';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Add animation effect
    if (animated) {
      let animationFrame = 0;
      const animate = () => {
        if (animationFrame < 60) {
          animationFrame++;
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [rangeMap, showComparison, animated]);

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Your Range Map
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          {showComparison
            ? 'Visual comparison of your comfort zone expansion'
            : 'Your current comfort zone across all four dimensions'}
        </p>

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full"
            style={{ width: '100%', maxWidth: '400px', height: 'auto' }}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {(['social', 'physical', 'professional', 'emotional'] as AvoidanceZone[]).map((zone) => (
            <div key={zone} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: getZoneHexColor(zone) }}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {getZoneLabel(zone)}
                </div>
                <div className="text-xs text-gray-500">
                  Radius: {Math.round(rangeMap.currentRadius[zone])}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Total Expansion</div>
            <div className="text-2xl font-bold text-primary-900">
              {Math.round(
                (rangeMap.currentRadius.social +
                  rangeMap.currentRadius.physical +
                  rangeMap.currentRadius.professional +
                  rangeMap.currentRadius.emotional) /
                  4 -
                  rangeMap.startRadius
              )}
              {' '}units
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
