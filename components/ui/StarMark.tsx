/** Bintang delapan (khatam): dua persegi bertumpuk. Satu-satunya ornamen berulang di situs ini. */
export function StarMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    >
      <rect x="7" y="7" width="18" height="18" />
      <rect x="7" y="7" width="18" height="18" transform="rotate(45 16 16)" />
    </svg>
  );
}
