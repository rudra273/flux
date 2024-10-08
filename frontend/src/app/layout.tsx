
import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "../providers/AuthProvider";
import SideNav from "../components/SideNav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Flux - Share and Discover",
  description: "A platform for sharing and discovering posts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <SideNav />
            <div className="flex-1 md:pl-[var(--sidebar-width,0px)] transition-all duration-300">
              <main className="p-4 md:p-8">
                {children}
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
