import type { Metadata } from "next";
import { Chivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
// import { SourceCodeProOverrided } from "@/components/font_overrided";
import { Toaster } from "@/components/ui/toaster";
import NProgress from "./nprogress";

const chivo = Chivo({ subsets: ["latin"] });
const roadRage = localFont({ src: "./Road_Rage.otf", variable: "--font-road-rage" });

export const metadata: Metadata = {
  title: "PLYR[DEX]",
  description: "Explore the future of gaming with PLYR Chain. Empowering developers and gamers alike, our blockchain platform revolutionizes the gaming experience.",
  openGraph: {
    title: "PLYR[CONNECT]",
    description: "Explore the future of gaming with PLYR Chain. Empowering developers and gamers alike, our blockchain platform revolutionizes the gaming experience.",
    images: [
      'https://plyr.network/social_share/global.png'
    ]
  },
  twitter: {
    title: "PLYR[DEX]",
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
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff"></meta>
      </head>
      <body className={`${chivo.className} ${roadRage.variable}`}>
        <NProgress />

        {children}

        <Toaster />

        {
          process.env.NEXT_PUBLIC_NETWORK_TYPE !== 'mainnet' && <div className="fixed z-50 bottom-0 left-0 bg-yellow-300 w-full h-6 text-xs flex items-center justify-center">
            You're on the Testnet environment.
          </div>
        }
      </body>
    </html>
  );
}
