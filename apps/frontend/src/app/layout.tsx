import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "System Design Academy",
  description:
    "আমার ব্যক্তিগত system design শেখার platform — দিনে ৩০ মিনিট, সপ্তাহে ৪ দিন",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
