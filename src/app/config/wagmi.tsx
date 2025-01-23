import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { metaMaskWallet, walletConnectWallet, rabbyWallet, coreWallet } from "@rainbow-me/rainbowkit/wallets"

import { clientTransports, wagmiChains } from "@/app/config/chains"
import { config } from "process"

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}

const appName = "Tesseract"
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

export const wagmiConfig = getDefaultConfig({
    appName: appName,
    projectId: projectId,
    chains: wagmiChains,
    transports: clientTransports,
    wallets: [
        {
            groupName: "Popular",
            wallets: [coreWallet, rabbyWallet, metaMaskWallet, walletConnectWallet],
        },
    ],
    ssr: true,
})
