"use client";
import { ConnectButton, darkTheme } from "thirdweb/react";
import { client, phiChain, tauChain } from "@/lib/thirdweb_client";
import { wallets } from "@/config/wallet";

export default function WalletButton() {

    return <ConnectButton
        autoConnect={true}
        client={client}
        wallets={wallets} 
        // Remove chain prop if reqChain is undefined
        //chain={reqChain ? reqChain : null}
        walletConnect={
            {
                projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID
            }
        }
        showAllWallets={false}
        
        theme={darkTheme({
            colors: {
                accentText: "#ff6600",
                accentButtonBg: "#ff6600",
                primaryButtonBg: "#000000",
                primaryButtonText: "#ffffff",
                skeletonBg: "#fdfcfd",
                selectedTextColor: "#fdfcfd",
                selectedTextBg: "#fdfcfd",
            },
        })}
        connectButton={{
            label: "CONNECT",
            className: "ThirdwebWalletBtn"
        }}
        connectModal={{
            size: "compact",
            title: "Choose your Wallet",
            titleIcon: "https://plyr.network/logo/plyr_icon_orange.svg",
            showThirdwebBranding: false,
        }}
        detailsButton={{
            className: "ThirdwebWalletBtn",
            
        }}
        detailsModal={{
            showTestnetFaucet: true,
        }}
        switchButton={{
            className: "ThirdwebWalletBtn",
        }}

    />
}