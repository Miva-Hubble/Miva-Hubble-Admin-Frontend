import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/auth/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIVA Hubble Admin",
  description: "Admin dashboard for MIVA Hubble",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  );
}
