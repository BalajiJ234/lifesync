import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileNavigation from "@/components/MobileNavigation";
import NotificationBanner from "@/components/ui/NotificationBanner";
import ReduxProvider from "@/store/ReduxProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeSync - Privacy-First Personal Finance",
  description: "Track expenses, set goals, and get AI insights - all while keeping your data on YOUR device. No cloud, no tracking, 100% private.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen touch-manipulation`}
      >
        <ReduxProvider>
          <SettingsProvider>
            <NotificationBanner />
            <MobileNavigation />
            <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-20 md:pb-8 max-w-7xl">
              {children}
            </main>
          </SettingsProvider>
        </ReduxProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                const cleanupServiceWorkers = async () => {
                  try {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(registrations.map(async (registration) => {
                      try {
                        await registration.unregister();
                      } catch (error) {
                        console.log('SW unregister failed:', error);
                      }
                    }));
                  } catch (error) {
                    console.log('SW lookup failed:', error);
                  }

                  if ('caches' in window) {
                    try {
                      const cacheKeys = await caches.keys();
                      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
                    } catch (error) {
                      console.log('Cache cleanup failed:', error);
                    }
                  }
                };

                window.addEventListener('load', () => {
                  cleanupServiceWorkers().catch((error) => {
                    console.log('SW cleanup failed:', error);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
