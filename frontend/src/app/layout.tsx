import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { SerwistProvider } from "@/components/pwa/serwist-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
});

const APP_NAME = "Try Giraffes";
const APP_DESCRIPTION = "Try Giraffes Asset Management";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F3F8FB",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className={`${publicSans.className} min-h-full bg-white text-[#2a2a2a]`} suppressHydrationWarning>
        <ThemeProvider>
          <SerwistProvider>{children}</SerwistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
