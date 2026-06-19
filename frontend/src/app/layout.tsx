import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import { AuthProvider } from '@/components/AuthProvider';
import AuthButton from '@/components/AuthButton';

export const metadata: Metadata = {
  title: 'FlightHack | Cheap Route Finder',
  description: 'Find the absolute cheapest flight options using multi-leg routing and VPN tricks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <ThemeToggle />
            <AuthButton />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}