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
    const activeAccount = useActiveAccount();
    // Store the previous active wallet
    const [previousActiveWallet, setPreviousActiveWallet] = useState<Wallet<WalletId> | undefined>(undefined);

    useEffect(() => {
        console.log('thirdwebWallet', thirdwebWallet)
        setPreviousActiveWallet(thirdwebWallet);
    }, [thirdwebWallet])

    useEffect(() => {

        const setActive = async () => {

            if (walletClient) {
                // Store the current active wallet before setting the new one

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

        //Clean up function to restore the previous active wallet when unmounting
        return () => {

            if (previousActiveWallet && activeAccount) {
                console.log('previousActiveWallet', previousActiveWallet)
                setActiveWallet(previousActiveWallet);
            }
        };
    }, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet]);


    useEffect(() => {
        const disconnectIfNeeded = async () => {
            if (thirdwebWallet && wagmiAccount.status === "disconnected") {
                await thirdwebWallet.disconnect();
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


                <div className="flex w-full max-w-3xl mx-auto flex-col items-center justify-center mt-16 pb-24 lg:pb-0">
                    <SwapPage />
                </div>

            </Suspense >

        </>
    );
}
