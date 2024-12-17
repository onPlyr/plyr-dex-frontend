// import { createConfig } from "wagmi";
// import { clientTransports, wagmiChains } from "@/app/config/chains"
// import { walletConnect, injected } from "@wagmi/connectors"


// const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

// export const wagmiConfig = createConfig({
//     chains: wagmiChains,
//     transports: clientTransports,
//     connectors: [
//         injected(),
//         walletConnect({ projectId})
//     ],
//     ssr: true,
// })

import { metaMaskWallet, walletConnectWallet, rabbyWallet, coreWallet } from "@rainbow-me/rainbowkit/wallets"
import { clientTransports, wagmiChains } from "@/app/config/chains"
import { getDefaultConfig } from "@rainbow-me/rainbowkit"

const appName = "PLYR[SWAP]"
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ""

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
    //ssr: true,
})