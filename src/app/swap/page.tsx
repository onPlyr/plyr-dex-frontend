"use client";

import Image from "next/image";
// import { ConnectTWButton } from "@/components/thirdweb_connectbutton";

import SwapPage from "@/app/components/swap/SwapPage";
import { Suspense, useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { Providers } from "@/app/providers/providers"
import { loadTokenList } from "@/app/loadTokenList";
import Header from "@/components/layout/header";
import "@/app/styles/globals.css"

import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import {
    useSetActiveWallet,
    PayEmbed,
    ConnectButton,
    TransactionButton,
    useActiveWallet,
    MediaRenderer,
    useReadContract,
    useActiveAccount,
} from "thirdweb/react";
import { createWalletAdapter, Wallet, WalletId } from "thirdweb/wallets";
import { claimTo, getNFT } from "thirdweb/extensions/erc1155";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useSwitchChain,
    useWalletClient,
} from "wagmi";
import { client } from "@/lib/thirdweb_client";
// import { usePlyrIdInfo } from "@/store/plyridinfo";
// import { usePreviousActiveWallet } from "@/store/previousActiveWallet";

const CHAIN_ID = process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831;

export default function Main() {
    const wagmiAccount = useAccount();
    const { connectors, connect, status, error } = useConnect();
    const { disconnectAsync } = useDisconnect();
    // This is how to set a wagmi account in the thirdweb context to use with all the thirdweb components including Pay
    const { data: walletClient } = useWalletClient();
    const { switchChainAsync } = useSwitchChain();
    const setActiveWallet = useSetActiveWallet();

    // handle disconnecting from wagmi
    const thirdwebWallet = useActiveWallet();

    useEffect(() => {

        const setActive = async () => {

            if (walletClient) {
                // Store the current active wallet before setting the new one
                console.log("walletClient", walletClient)

                const adaptedAccount = viemAdapter.walletClient.fromViem({
                    walletClient: walletClient as any, // accounts for wagmi/viem version mismatches
                });
                const w = createWalletAdapter({
                    adaptedAccount,
                    chain: defineChain(await walletClient.getChainId()),
                    client: client,
                    onDisconnect: async () => {
                        await disconnectAsync();
                    },
                    switchChain: async (chain) => {
                        await switchChainAsync({ chainId: chain.id as any });
                    },
                });

                setActiveWallet(w);

            }
        };
        setActive();
    }, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet]);


    useEffect(() => {
        const disconnectIfNeeded = async () => {
            if (thirdwebWallet && wagmiAccount.status === "disconnected") {
                //alert('disconnecting')
                await thirdwebWallet?.disconnect();
            }
        };
        disconnectIfNeeded();
    }, [wagmiAccount, thirdwebWallet]);

    // Fetch Token List //
    // const tokenList = await loadTokenList();

    return (
        <>

            <Header />

            <Suspense fallback={
                <div className="flex w-full px-6 flex-col items-center min-h-screen">
                    <section className="w-full flex flex-row items-center justify-center py-8 ">
                        <Image loading="eager" src="/logo/plyr_orange_black.svg" alt="Plyr | Dashboard" width={200} height={250} className="w-36 mr-4" /> <span className="text-black text-sm md:text-lg"> | DASHBOARD</span>
                    </section>
                    <div className="w-full flex flex-row items-center justify-center">
                        <Loader2 className="w-16 h-16 animate-spin" />
                    </div>
                </div>
            }>


                <div className="flex w-full max-w-3xl mx-auto flex-col items-center justify-center mt-[6.5rem] pb-24 lg:pb-12">
                    <SwapPage />
                </div>

            </Suspense >

        </>
    );
}
