import React from 'react';

interface HandoverQRCodeProps {
  value: string;
  label?: string;
  size?: number;
}

/**
 * Clean, prominent OTP badge display for direct handover verification.
 * Focuses on readable 4-digit numeric code rather than camera scanning.
 */
export const HandoverQRCode: React.FC<HandoverQRCodeProps> = ({
  value,
  label = 'Verification OTP',
}) => {
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-sm text-center space-y-2 inline-block min-w-[160px]">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs">
        <i className="fa-solid fa-shield-halved text-emerald-700 text-base" />
      </div>

      <div className="space-y-1">
        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-3xl font-black tracking-[0.3em] text-emerald-800 font-mono bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-300 select-all shadow-xs">
          {value}
        </div>
        <div className="text-[10px] text-stone-400 font-medium flex items-center justify-center space-x-1">
          <i className="fa-solid fa-lock text-[9px] text-stone-400" />
          <span>Share this 4-digit OTP</span>
        </div>
      </div>
    </div>
  );
};

export default HandoverQRCode;
