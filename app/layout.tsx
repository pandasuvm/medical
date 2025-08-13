import '../styles/globals.css';
import React from 'react';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'MEAR - Manipal Emergency Airway Registry',
  description: 'Mobile-optimized emergency medical data entry system',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MEAR'
  },
  themeColor: '#3b82f6',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MEAR" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-slate-50 antialiased">
        <main className="min-h-screen">
          {children}
        </main>

        {/* Toast notifications optimized for mobile */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000, // Changed from 4000 to 4000 (4 seconds)
            style: {
              background: '#ffffff',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '14px',
              maxWidth: '90vw',
              padding: '12px 16px'
            },
            success: {
              duration: 3000, // 4 seconds for success messages
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 3000, // 5 seconds for error messages (slightly longer)
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              duration: Infinity, // Loading toasts stay until dismissed
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#ffffff',
              },
            }
          }}
        />
      </body>
    </html>
  );
}
