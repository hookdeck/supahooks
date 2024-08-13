import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SupaHooks - Hookdeck Outbound Webhooks Demo",
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
          <div className="z-10 w-full max-w-5xl items-start justify-between lg:flex mt-4 border-b-2 pb-4 border-b-slate-500">
            <div className="flex flex-col justify-start items-start gap-2">
              <h1 className="flex text-xl dark:from-inherit lg:static lg:w-auto">
                <Link className="no-underline" href="/">
                  SupaHooks
                </Link>
              </h1>
              <h2 className="font-mono text-sm">
                Hookdeck Outbound Webhooks Demo
              </h2>
            </div>
            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
              <a
                className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 no-underline"
                href="https://hookdeck.com?ref=outbound-webhooks-demo"
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
                  style={{ height: "auto" }}
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
