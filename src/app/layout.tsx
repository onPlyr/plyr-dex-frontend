import { Metadata } from "next"
import Image from "next/image"

import { Chivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";



import { Toaster } from "@/src/components/ui/toaster";
import BProgress from "@/app/bprogress";

import Header from "@/src/components/layout/header";
//import AccountDetailButton from "@/app/components/account/AccountDetailButton"
//import BackgroundParticles from "@/app/components/ui/BackgroundParticles"
//import { montserrat, sourceCodePro } from "@/app/config/fonts"
import { Providers } from "@/app/providers/providers"
//import logoBrand from "@/public/logos/logo-white.png"

const chivo = Chivo({ subsets: ["latin"] });
//const roadRage = localFont({ src: "./Road_Rage.otf", variable: "--font-road-rage" });
const boldFinger = localFont({ src: "./Boldfinger.ttf", variable: "--font-bold-finger" });
//const disableBgParticles = true;

const metaName = "PLYR[SWAP] – Multichain DEX for Gamers"
const metaDescription = "PLYR[SWAP] is a multichain DEX powering the PLYR Gaming Universe. Add liquidity, earn rewards, and enable seamless swaps across Avalanche L1s."
const metaUrl = "https://swap.onplyr.com"

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
            'https://plyr.network/social_share/plyrswap.png'
        ]
    },
    twitter: {
        card: "summary_large_image",
        site: "@OnPlyr",
        creator: "@OnPlyr",
        title: metaName,
        description: metaDescription,
        images: [
            'https://plyr.network/social_share/plyrswap.png'
        ]
    },
}


const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="en" className={`${chivo.className} ${boldFinger.variable}`}>
            <body className="text-sm">
                <Toaster />
                <Providers>
                    <BProgress>
                        <Header />
                        <div className="flex flex-col pt-8 pb-24 lg:pb-8  items-center overflow-x-hidden">
                            {children}
                        </div>
                    </BProgress>
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
