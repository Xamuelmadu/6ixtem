
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "6ixtem | Business Operating Systems",
    template: "%s | 6ixtem",
  },
  description:
    "6ixtem designs business operating systems that bring client management, staff operations, communication and workflows into one coordinated environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-31Y8PT71ZF" />
      </body>
    </html>
  );
}
