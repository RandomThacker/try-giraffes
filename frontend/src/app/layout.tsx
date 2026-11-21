import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Try Giraffes",
    template: "%s · Try Giraffes",
  },
  description: "Try Giraffes",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className={`${publicSans.className} min-h-full bg-white text-[#2a2a2a]`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
