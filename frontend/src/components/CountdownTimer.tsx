'use client';

import React, { useState, useEffect } from 'react';

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

  // If already delivered or completed, show delivered badge with Font Awesome circle-check
  if (status === 'DELIVERED' || status === 'COMPLETED') {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 ${className}`}>
        {showIcon && <i className="fa-solid fa-circle-check text-emerald-700" />}
        <span>Delivered Safely Before Expiry</span>
      </span>
    );
  }

  // If expired: show Font Awesome warning with fa-fade animation
  if (timeLeft.isExpired) {
    return (
      <span className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 ${className}`}>
        {showIcon && <i className="fa-solid fa-triangle-exclamation fa-fade text-rose-600" />}
        <span>Expired • Not for consumption</span>
      </span>
    );
  }

  // Format countdown string
  const pad = (n: number) => n.toString().padStart(2, '0');
  const { days, hours, minutes, seconds, totalSeconds } = timeLeft;

  // Font Awesome icon and styles based on urgency
  let badgeStyles = 'text-stone-800 bg-stone-100 border-stone-300';
  let faIcon = 'fa-solid fa-clock text-stone-500';

  if (totalSeconds < 3600) {
    // Under 1 hour: Font Awesome fa-beat pulsating alarm
    badgeStyles = 'text-rose-900 bg-rose-50 border-rose-300';
    faIcon = 'fa-solid fa-clock fa-beat text-rose-600';
  } else if (totalSeconds < 3 * 3600) {
    // Under 3 hours: Font Awesome hourglass warning
    badgeStyles = 'text-amber-900 bg-amber-50 border-amber-300';
    faIcon = 'fa-solid fa-hourglass-half text-amber-600';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg border shadow-xs ${badgeStyles} ${className}`}>
      {showIcon && <i className={`${faIcon} text-xs`} />}
      <span>
        {days > 0 ? `${days}d ` : ''}
        {pad(hours)}h:{pad(minutes)}m:{pad(seconds)}s left
      </span>
    </span>
  );
};

export default CountdownTimer;
