type LogoProps = {
  tone?: "light" | "brand";
  layout?: "horizontal" | "stacked";
  className?: string;
};

const sources = {
  "horizontal-brand": {
    src: "/images/logo-horizontal-brand.svg",
    width: 209,
    height: 30,
    className: "h-[28px] w-auto",
  },
  "horizontal-light": {
    src: "/images/logo-horizontal-light.svg",
    width: 209,
    height: 30,
    className: "h-[28px] w-auto",
  },
  "stacked-brand": {
    src: "/images/logo-stacked-brand.svg",
    width: 130,
    height: 61,
    className: "h-[61px] w-auto",
  },
} as const;

export function Logo({ tone = "brand", layout = "horizontal", className = "" }: LogoProps) {
  const key =
    layout === "stacked"
      ? "stacked-brand"
      : tone === "light"
        ? "horizontal-light"
        : "horizontal-brand";
  const asset = sources[key];

  // Native img keeps SVG crisp; next/image can rasterize vectors poorly.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt="Try Giraffes"
      width={asset.width}
      height={asset.height}
      className={`${asset.className} ${className}`}
    />
  );
}
