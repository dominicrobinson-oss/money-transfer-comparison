import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Transfer Comparison - GBP to NGN",
  description: "Compare money transfer services for GBP to NGN transfers",
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
      </body>
    </html>
  );
}
