import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Project Hub",
  description: "Showcase and collaborate on university projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

