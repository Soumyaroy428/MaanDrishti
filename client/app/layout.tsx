import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MaanDrishti",
  description: "Separated Next.js client and Express server",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
