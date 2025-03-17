import { Metadata } from "next"
import Image from "next/image"

import { Chivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";



import { Toaster } from "@/src/components/ui/toaster";
import NProgress from "./nprogress";

import Header from "@/src/components/layout/header";
//import AccountDetailButton from "@/app/components/account/AccountDetailButton"
//import BackgroundParticles from "@/app/components/ui/BackgroundParticles"
//import { montserrat, sourceCodePro } from "@/app/config/fonts"
import { Providers } from "@/app/providers/providers"
//import logoBrand from "@/public/logos/logo-white.png"

const chivo = Chivo({ subsets: ["latin"] });
const roadRage = localFont({ src: "./Road_Rage.otf", variable: "--font-road-rage" });

//const disableBgParticles = true;

const metaName = "PLYR[SWAP]"
const metaDescription = "Explore the future of gaming with PLYR Chain. Empowering developers and gamers alike, our blockchain platform revolutionizes the gaming experience."
const metaUrl = "https://plyr.network"

export const metadata: Metadata = {
    title: {
        template: `%s | ${metaName}`,
        default: metaName,
    },
    description: metaDescription,
    // category: "???",
    applicationName: metaName,
    referrer: "same-origin",
    keywords: [
        metaName,
        "Avalanche",
        "AVAX",
        "L1",
        "DeFi",
    ],
    metadataBase: new URL(metaUrl),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: metaName,
        description: metaDescription,
        url: metaUrl,
        siteName: metaName,
        type: "website",
        images: [
            'https://plyr.network/social_share/global.png'
        ]
    },
    twitter: {
        card: "summary_large_image",
        site: "@OnPlyr",
        creator: "@OnPlyr",
        title: metaName,
        description: metaDescription,
        images: [
            'https://plyr.network/social_share/global.png'
        ]
    },
}


const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="en" className={`${chivo.className} ${roadRage.variable}`}>
            <body className="text-sm">
                <Toaster />
                <Providers>
                    <NProgress />
                    <Header />
                    <div className="flex flex-col pt-8 pb-24 lg:pb-8  items-center overflow-x-hidden">
                        {children}
                    </div>
                </Providers>

                {
                    process.env.NEXT_PUBLIC_NETWORK_TYPE !== 'mainnet' && <div className="text-black fixed z-50 bottom-0 left-0 bg-[#daff00] w-full h-6 text-xs flex items-center justify-center">
                        You're on the Testnet environment.
                    </div>
                }
            </body>
        </html>
    )
}

export default RootLayout
