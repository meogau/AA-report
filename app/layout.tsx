import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AA Report Explorer",
  description: "Serverless-ready Next.js site for deploying on Vercel."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
