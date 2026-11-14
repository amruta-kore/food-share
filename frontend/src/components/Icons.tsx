import React from 'react';

/**
 * Font Awesome Icon Component Library for AnnaSetu
 * Uses Font Awesome 6 (Solid, Regular, Brands) with features:
 * - Fixed-width (fa-fw) for aligned navigation and lists
 * - Animations: fa-beat (urgent pulse), fa-spin (smooth loading), fa-fade (subtle breath)
 * - Sizing: fa-xs, fa-sm, fa-lg, fa-xl, fa-2xl
 * - Stacks: fa-stack for layered badges
 */

export interface FaProps {
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl';
  spin?: boolean;
  beat?: boolean;
  fade?: boolean;
  fw?: boolean;
}

export const FaIcon: React.FC<{
  icon: string;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl';
  spin?: boolean;
  beat?: boolean;
  fade?: boolean;
  fw?: boolean;
}> = ({ icon, className = '', size, spin, beat, fade, fw }) => {
  const sizeClass = size ? `fa-${size}` : '';
  const spinClass = spin ? 'fa-spin' : '';
  const beatClass = beat ? 'fa-beat' : '';
  const fadeClass = fade ? 'fa-fade' : '';
  const fwClass = fw ? 'fa-fw' : '';
  return (
    <i
      className={`${icon} ${sizeClass} ${spinClass} ${beatClass} ${fadeClass} ${fwClass} ${className}`.trim()}
      aria-hidden="true"
    />
  );
};

// Brand Logo: Font Awesome Layered Bridge & Wheat / Seedling
export const BrandLogoIcon: React.FC<{ className?: string }> = ({ className = 'text-xl' }) => (
  <span className={`inline-flex items-center justify-center space-x-0.5 ${className}`}>
    <i className="fa-solid fa-bridge-water text-emerald-700" title="Setu (Bridge)" />
    <i className="fa-solid fa-wheat-awn text-amber-500 text-[0.8em] -ml-1 -mt-1.5" title="Anna (Food/Grain)" />
  </span>
);

// FSSAI Veg Symbol: Font Awesome Green Square with Dot
export const VegBadge: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <span
    className={`inline-flex items-center justify-center border-2 border-emerald-700 rounded-xs bg-white p-[2px] leading-none ${className}`}
    style={{ width: size, height: size }}
    title="100% Vegetarian (FSSAI)"
  >
    <i className="fa-solid fa-circle text-emerald-700 text-[8px]" />
  </span>
);

// FSSAI Non-Veg Symbol: Font Awesome Brown Square with Triangle
export const NonVegBadge: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <span
    className={`inline-flex items-center justify-center border-2 border-amber-900 rounded-xs bg-white p-[2px] leading-none ${className}`}
    style={{ width: size, height: size }}
    title="Non-Vegetarian (FSSAI)"
  >
    <i className="fa-solid fa-play -rotate-90 text-amber-900 text-[7px]" />
  </span>
);

// Utensils / Commercial Kitchen / Food Donor (Font Awesome Utensils)
export const UtensilsIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-utensils ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Bowl Food (Alternative Donor/Meal Icon)
export const BowlFoodIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-bowl-food ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Building / Shelter / NGO (Font Awesome Building & Hand Holding Heart)
export const BuildingIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-hand-holding-heart ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

export const ShelterIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-people-roof ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Courier / Volunteer Transport (Font Awesome Fast Delivery Truck & Motorcycle)
export const TruckIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-truck-fast ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

export const MotorcycleIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-motorcycle ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

export const BicycleIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-person-biking ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Location Pin (Font Awesome Location Dot)
export const MapPinIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-location-dot ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Clock / Countdown Timer (Font Awesome Clock with optional beat animation)
export const ClockIcon: React.FC<FaProps> = ({ className = '', beat = false, fw = false }) => (
  <i className={`fa-solid fa-clock ${beat ? 'fa-beat' : ''} ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Verified Shield (Font Awesome Shield Halved & Circle Check)
export const ShieldCheckIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-shield-halved ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Check Circle (Font Awesome Circle Check)
export const CheckCircleIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-circle-check ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

export const CheckCircle2Icon = CheckCircleIcon;

// Search (Font Awesome Magnifying Glass)
export const SearchIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-magnifying-glass ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Filter (Font Awesome Sliders / Filter)
export const FilterIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-sliders ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Arrow Right / Chevron (Font Awesome Arrow Right)
export const ArrowRightIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-arrow-right ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// User / Profile (Font Awesome Circle User)
export const UserIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-circle-user ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Globe / Planetary Impact (Font Awesome Earth Americas)
export const GlobeIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-earth-americas ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Sparkles / Magic (Font Awesome Wand Magic Sparkles)
export const SparklesIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-wand-magic-sparkles ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Lock (Font Awesome Lock)
export const LockIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-lock ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Eye / Show Password (Font Awesome Eye)
export const EyeIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-eye ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Eye Off / Hide Password (Font Awesome Eye Slash)
export const EyeOffIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-eye-slash ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Alert Triangle (Font Awesome Triangle Exclamation with optional pulse)
export const AlertTriangleIcon: React.FC<FaProps> = ({ className = '', beat = false, fw = false }) => (
  <i className={`fa-solid fa-triangle-exclamation ${beat ? 'fa-beat' : ''} ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Star (Font Awesome Solid & Regular Star)
export const StarIcon: React.FC<{ filled?: boolean; className?: string; fw?: boolean }> = ({
  filled = true,
  className = '',
  fw = false,
}) => (
  <i
    className={`${filled ? 'fa-solid fa-star text-amber-400' : 'fa-regular fa-star text-stone-300'} ${
      fw ? 'fa-fw' : ''
    } ${className}`.trim()}
    aria-hidden="true"
  />
);

// Crosshair / Detect GPS (Font Awesome Crosshairs)
export const CrosshairIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-crosshairs ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// File / Document Upload (Font Awesome File Lines)
export const FileTextIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-file-lines ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Upload Cloud (Font Awesome Cloud Arrow Up)
export const UploadCloudIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-cloud-arrow-up ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// QR Code (Font Awesome QR Code)
export const QrCodeIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-qrcode ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Water Droplet (Font Awesome Droplet)
export const DropletIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-droplet ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Comments / Feedback Bubble (Font Awesome Comments)
export const CommentsIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-comments ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Heart & Handshake (Font Awesome Handshake Angle)
export const HeartHandshakeIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-handshake-angle ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Spinner / Loader (Font Awesome Circle Notch Spin)
export const SpinnerIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 text-emerald-700' }) => (
  <i className={`fa-solid fa-circle-notch fa-spin ${className}`} aria-hidden="true" />
);

// Language Switcher (Font Awesome Language)
export const LanguageIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-language ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);

// Sign Out (Font Awesome Right From Bracket)
export const LogOutIcon: React.FC<FaProps> = ({ className = '', fw = false }) => (
  <i className={`fa-solid fa-right-from-bracket ${fw ? 'fa-fw' : ''} ${className}`.trim()} aria-hidden="true" />
);
