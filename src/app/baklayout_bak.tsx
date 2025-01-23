import type { Metadata } from "next";
import { Chivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// import { SourceCodeProOverrided } from "@/components/font_overrided";
import { Toaster } from "@/components/ui/toaster";
import NProgress from "./nprogress";
import { Providers } from "./providers/providers";
import Header from "@/components/layout/header";

const chivo = Chivo({ subsets: ["latin"] });
const roadRage = localFont({ src: "./Road_Rage.otf", variable: "--font-road-rage" });

export const metadata: Metadata = {
  title: "PLYR[SWAP]",
  description: "Explore the future of gaming with PLYR Chain. Empowering developers and gamers alike, our blockchain platform revolutionizes the gaming experience.",
  openGraph: {
    title: "PLYR[CONNECT]",
    description: "Explore the future of gaming with PLYR Chain. Empowering developers and gamers alike, our blockchain platform revolutionizes the gaming experience.",
    images: [
      'https://plyr.network/social_share/global.png'
    ]
  },
  twitter: {
    title: "PLYR[SWAP]",
    card: "summary_large_image",
    creator: "@onPlyr",
    images: [
      'https://plyr.network/social_share/global.png'
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        {/* <SourceCodeProOverrided fontClassName={chivo.className} /> */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="PLYR[SWAP]" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${chivo.className} ${roadRage.variable}`}>
        <NProgress />
        <Providers>
          <Header />
          {children}
        </Providers>

        <Toaster />

        {
          process.env.NEXT_PUBLIC_NETWORK_TYPE !== 'mainnet' && <div className="text-black fixed z-50 bottom-0 left-0 bg-[#daff00] w-full h-6 text-xs flex items-center justify-center">
            You're on the Testnet environment.
          </div>
        }
      </body>
    </html>
  );
}
