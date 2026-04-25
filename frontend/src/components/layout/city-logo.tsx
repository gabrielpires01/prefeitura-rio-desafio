export function CityLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <circle cx="50" cy="18" r="9" fill="currentColor" opacity="0.9" />
      <path d="M8 82 Q28 38 50 48 Q72 58 92 82 Z" fill="currentColor" opacity="0.5" />
      <path d="M15 82 Q35 52 50 58 Q65 64 85 82 Z" fill="currentColor" opacity="0.75" />
      <path d="M24 82 Q40 62 50 65 Q60 68 76 82 Z" fill="currentColor" />
    </svg>
  );
}
