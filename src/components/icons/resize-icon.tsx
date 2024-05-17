export function ResizeIcon({ className = "" }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01M8 8h.01M12 8h.01M16 8h.01"
      ></path>
    </svg>
  );
}
