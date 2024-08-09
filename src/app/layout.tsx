import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Outbound Webhooks Demo - Hookdeck",
  description:
    "A basic dashboard example that shows how to use Hookdeck as outbound webhook infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col items-center p-24 pt-4">
          <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
            <h1 className="fixed left-0 top-0 flex w-full justify-center text-xl pb-6 pt-8 dark:from-inherit lg:static lg:w-auto ">
              <Link href="/">Outbound Webhooks Demo</Link>
            </h1>
            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
              <a
                className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                By{" "}
                <Image
                  src="/hookdeck.svg"
                  alt="Hookdeck Logo"
                  className="dark:invert"
                  width={150}
                  height={30}
                  priority
                />
              </a>
            </div>
          </div>
          <main className="flex flex-col w-full h-full max-w-5xl flex-grow mt-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
