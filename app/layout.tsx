import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const hachi = localFont({
  src: "../HachiMaruPop-Regular.ttf",
  variable: "--font-hachi",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Busterchi",
  description: "Kawaii greyhound tamagotchi PWA",
  manifest: "/manifest.json",
  themeColor: "#F6C1D0",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/icon-192.png"
  },
  appleWebApp: {
    capable: true,
    title: "Busterchi",
    statusBarStyle: "default"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hachi.variable} hachi-maru-pop-regular antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
