import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react"

const inter = Inter({
  subsets: ["latin"],
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x00m",
  description: "Video Call + Sketch + Coding labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} ${sourceSerif4.className} ${jetBrainsMono.className} antialiased`}
        >
          
              <SessionProvider>
          {children}
              </SessionProvider>
        </body>
    </html>
  );
}
