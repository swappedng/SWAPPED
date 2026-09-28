import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers";
import { Inter, Fira_Sans } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const firaSans = Fira_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-fira-sans'
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
    <html lang="en" className={firaSans.variable}>
      <body className={firaSans.className}>
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
        <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
