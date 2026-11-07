import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Swapped",
  description: "Trade in your old phone for a new one.",
  icons: {
    icon: "/swapped-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap" />
      </head>
      <body className={geist.className}>
        <AuthProvider>
          {/* <header className="py-6 px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/swapped-logo.png"
                alt="Swapped Logo"
                width={32}
                height={32}
              />
              <span className="apple-headline text-gray-900">SWAPPED</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/tradein" className="apple-body text-gray-600 hover:text-blue-600 transition-colors">
                Trade In
              </Link>
              <Link href="/about" className="apple-body text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
            </nav>
          </div>
        </header> */}
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
