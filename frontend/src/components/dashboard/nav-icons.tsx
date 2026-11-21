import type { ReactNode } from "react";

type IconProps = { className?: string };

function base({ className }: IconProps, children: ReactNode) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function NavIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  switch (name) {
    case "home":
      return base({ className }, <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />);
    case "chat":
      return base({ className }, <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />);
    case "clipboard":
      return base({ className }, <>
        <rect x="6" y="5" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 5.5h6V7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5.5Z" stroke="currentColor" strokeWidth="1.6" />
      </>);
    case "bars":
      return base({ className }, <path d="M6 18V11M12 18V7M18 18v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />);
    case "bag":
      return base({ className }, <>
        <path d="M6.5 9h11l-.8 10.2a1.5 1.5 0 0 1-1.5 1.3H8.8a1.5 1.5 0 0 1-1.5-1.3L6.5 9Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 9V7.5A3 3 0 0 1 12 4.5 3 3 0 0 1 15 7.5V9" stroke="currentColor" strokeWidth="1.6" />
      </>);
    case "trend":
      return base({ className }, <path d="M4 16 10 10l4 4 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />);
    case "clock":
      return base({ className }, <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>);
    case "calc":
      return base({ className }, <>
        <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 8h8M8 12h2M12 12h2M16 12h1M8 16h2M12 16h2M16 16h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>);
    case "help":
      return base({ className }, <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9.8 9.4a2.4 2.4 0 1 1 3.5 2.1c-.7.4-1.3 1-1.3 1.8V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.9" fill="currentColor" />
      </>);
    case "headset":
      return base({ className }, <path d="M5 13V11a7 7 0 0 1 14 0v2M5 13a2 2 0 0 0 2 2h1v-5H7a2 2 0 0 0-2 2Zm14 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />);
    case "user":
      return base({ className }, <>
        <circle cx="12" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 19c1.5-3 4-4.5 6.5-4.5S17 16 18.5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>);
    case "id":
      return base({ className }, <>
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13.5 10.5h4M13.5 13.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>);
    case "bell":
      return base({ className }, <path d="M7 17h10M8.5 17a3.5 3.5 0 0 1 7 0M12 4.5V6M7.5 10a4.5 4.5 0 1 1 9 0c0 2.2.8 3.5 1.5 4.5H6c.7-1 1.5-2.3 1.5-4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />);
    case "calendar":
      return base({ className }, <>
        <rect x="4.5" y="6" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 4.5v3M16 4.5v3M4.5 10h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>);
    case "check":
      return base({ className }, <path d="m6.5 12.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />);
    case "close":
      return base({ className }, <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />);
    case "history":
      return base({ className }, <>
        <path d="M5 12a7 7 0 1 0 2-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 5.5V9h3.5M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>);
    case "plus":
      return base({ className }, <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />);
    case "chevron":
      return base({ className }, <path d="m9 7 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />);
    case "cake":
      return base({ className }, <path d="M6 13h12v6H6v-6Zm1.5 0V11a4.5 4.5 0 0 1 9 0v2M12 7.5V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />);
    case "doc":
      return base({ className }, <>
        <path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13 4.5V9h4.5" stroke="currentColor" strokeWidth="1.6" />
      </>);
    case "panel":
      return base({ className }, <>
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 5v14" stroke="currentColor" strokeWidth="1.6" />
      </>);
    case "more":
      return base({ className }, <>
        <rect x="4.5" y="4.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13.5" y="4.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <rect x="4.5" y="13.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13.5" y="13.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      </>);
    case "sun":
      return base({ className }, <>
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>);
    case "moon":
      return base({ className }, <path d="M16.5 14.2A6.8 6.8 0 0 1 9.8 7.5 6.2 6.2 0 1 0 16.5 14.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />);
    case "arrow-up":
      return base({ className }, <path d="M12 17V7m0 0 4 4M12 7 8 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />);
    case "arrow-down":
      return base({ className }, <path d="M12 7v10m0 0 4-4M12 17 8 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />);
    case "arrow-left":
      return base({ className }, <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />);
    case "upload":
      return base({ className }, <>
        <path d="M12 15V7m0 0 3.5 3.5M12 7 8.5 10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 16.5V18a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>);
    default:
      return base({ className }, <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.6" />);
  }
}
