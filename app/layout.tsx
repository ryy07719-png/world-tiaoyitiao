import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Tiaoyitiao",
  description: "Jump game with World ID",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MiniKitProvider
          props={{ appId: process.env.NEXT_PUBLIC_MINIKIT_APP_ID ?? "" }}
        >
          {children}
        </MiniKitProvider>
      </body>
    </html>
  );
}