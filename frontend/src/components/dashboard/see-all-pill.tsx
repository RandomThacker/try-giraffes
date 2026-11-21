import Link from "next/link";

const pillClass =
  "inline-flex shrink-0 items-center rounded-[8px] bg-[#EFF0F8] px-3 py-1.5 text-[12px] font-normal text-[#7D80A0] transition-colors hover:bg-[#E6E8F5] dark:bg-app-chip dark:text-app-muted-2 dark:hover:bg-app-muted-bg";

export function SeeAllPill({
  href,
  onClick,
}: {
  href?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <Link href={href} className={pillClass}>
        see all
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={pillClass}>
      see all
    </button>
  );
}
