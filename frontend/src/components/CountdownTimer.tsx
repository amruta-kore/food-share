'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  consumeBefore: string | Date;
  status?: string;
  showIcon?: boolean;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  consumeBefore,
  status,
  showIcon = true,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    totalSeconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    totalSeconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(consumeBefore).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (isNaN(targetTime) || diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          totalSeconds: 0,
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        totalSeconds,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [consumeBefore]);

  // If already delivered or completed, show delivered badge
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    return (
      <span className={`inline-flex items-center space-x-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 ${className}`}>
        {showIcon && <span>✓</span>}
        <span>Delivered Safely Before Expiry</span>
      </span>
    );
  }

  // If expired
  if (timeLeft.isExpired) {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 animate-pulse ${className}`}>
        {showIcon && <span>⛔</span>}
        <span>Expired / Not for consumption</span>
      </span>
    );
  }

  // Format countdown string
  const pad = (n: number) => n.toString().padStart(2, '0');
  const { days, hours, minutes, seconds, totalSeconds } = timeLeft;

  // Visual urgency levels:
  // Under 1 hour: critical red/amber
  // Under 3 hours: warning amber
  // Over 3 hours: healthy emerald
  let colorStyles = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let icon = '⏰';

  if (totalSeconds < 3600) {
    colorStyles = 'text-red-700 bg-red-50 border-red-200 animate-pulse';
    icon = '🔥';
  } else if (totalSeconds < 3 * 3600) {
    colorStyles = 'text-amber-700 bg-amber-50 border-amber-200';
    icon = '⏳';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${colorStyles} ${className}`}>
      {showIcon && <span className="font-sans">{icon}</span>}
      <span>
        {days > 0 ? `${days}d ` : ''}
        {pad(hours)}h:{pad(minutes)}m:{pad(seconds)}s left
      </span>
    </span>
  );
};

export default CountdownTimer;
