'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons';

interface CountdownTimerProps {
  consumeBefore?: string | Date;
  targetTime?: string | Date;
  status?: string;
  showIcon?: boolean;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  consumeBefore,
  targetTime: propTargetTime,
  status,
  showIcon = true,
  className = '',
}) => {
  const timeInput = consumeBefore || propTargetTime || '';

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
      const targetTimestamp = new Date(timeInput).getTime();
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (isNaN(targetTimestamp) || diff <= 0) {
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
  }, [timeInput]);

  // If already delivered or completed, show delivered badge
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 ${className}`}>
        {showIcon && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-700" />}
        <span>Delivered Safely Before Expiry</span>
      </span>
    );
  }

  // If expired
  if (timeLeft.isExpired) {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 ${className}`}>
        {showIcon && <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-600" />}
        <span>Expired • Not for consumption</span>
      </span>
    );
  }

  // Format countdown string
  const pad = (n: number) => n.toString().padStart(2, '0');
  const { days, hours, minutes, seconds, totalSeconds } = timeLeft;

  // Visual urgency levels:
  // Under 1 hour: critical red
  // Under 3 hours: warning amber
  // Over 3 hours: healthy stone/emerald
  let badgeStyles = 'text-stone-800 bg-stone-100 border-stone-300';
  let dotStyles = 'bg-emerald-600';

  if (totalSeconds < 3600) {
    badgeStyles = 'text-rose-900 bg-rose-50 border-rose-300 animate-pulse';
    dotStyles = 'bg-rose-600 animate-ping';
  } else if (totalSeconds < 3 * 3600) {
    badgeStyles = 'text-amber-900 bg-amber-50 border-amber-300';
    dotStyles = 'bg-amber-600';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg border shadow-xs ${badgeStyles} ${className}`}>
      {showIcon && (
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles.replace(' animate-ping', '')}`}></span>
        </span>
      )}
      <ClockIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
      <span>
        {days > 0 ? `${days}d ` : ''}
        {pad(hours)}h:{pad(minutes)}m:{pad(seconds)}s left
      </span>
    </span>
  );
};

export default CountdownTimer;
