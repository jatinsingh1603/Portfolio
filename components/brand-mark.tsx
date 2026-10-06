/** An offset evidence lens with a keyhole at its centre; no letterform. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="14" fill="#ed3025" />
      <path
        d="M49 29A20 20 0 1 0 29 49V42A13 13 0 1 1 42 29H49Z"
        fill="#101012"
      />
      <path
        d="M53 34H46A12 12 0 0 1 34 46V53A19 19 0 0 0 53 34Z"
        fill="#101012"
      />
      <path
        d="M29 22a5 5 0 0 0-2.25 9.47L25 38h8l-1.75-6.53A5 5 0 0 0 29 22Z"
        fill="#101012"
      />
    </svg>
  );
}
