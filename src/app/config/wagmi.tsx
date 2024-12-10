import { createConfig } from "wagmi";
import { clientTransports, wagmiChains } from "@/app/config/chains"


const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

export const wagmiConfig = createConfig({
    chains: wagmiChains,
    transports: clientTransports,
    ssr: true,
})
