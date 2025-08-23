import { Html, Head, Main, NextScript } from 'next/document';
import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A modern task management dashboard",
};

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
