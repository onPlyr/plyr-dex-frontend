"use client";
import Link from 'next/link';
import styles from './header.module.scss';
import Image from 'next/image';
import { Box, ChartBar, ChartCandlestick, ChartNoAxesCombined, ChevronDown, CircleDollarSign, History, PaintBucket, Settings } from 'lucide-react';
import WalletButton from '@/components/walletButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { phiChain, tauChain } from '@/lib/thirdweb_client';
import { AccountButton } from '@/app/components/account/AccountButton';
import AccountDetail from '@/app/components/account/AccountDetail';
import { useAccount, useWalletClient } from 'wagmi';
const NavList = () => {
    return (
        <>
            <Link href="/swap" className="w-full lg:w-fit flex-1 lg:flex-auto">
                <div className="px-4 relative flex-1 w-full lg:w-36 py-2 lg:rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-col lg:flex-row items-center justify-start gap-2">
                    <ChartCandlestick className="w-6 h-6 text-[#daff00]" />
                    SWAP
                    <div className="block lg:hidden absolute w-[1px] top-[2px] right-0 h-[calc(100%-4px)] bg-black/50"></div>
                </div>
            </Link>
            <Link href="/history" className="w-full lg:w-fit flex-1 lg:flex-auto">
                <div className="px-4 relative flex-1 w-full lg:w-36 py-2 lg:rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-col lg:flex-row items-center justify-start gap-2">
                    <History className="w-6 h-6 text-[#daff00]" />
                    HISTORY
                    <div className="block lg:hidden absolute w-[1px] top-[2px] right-0 h-[calc(100%-4px)] bg-black/50"></div>
                </div>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-full lg:w-fit flex-1 lg:flex-auto outline-none">
                        <div className="px-4 relative flex-1 w-full lg:w-36 py-2 lg:rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-col lg:flex-row items-center justify-start gap-2">
                            <CircleDollarSign className="min-w-6 min-h-6 text-[#daff00]" />
                            LIQUIDITY
                            <ChevronDown className="hidden lg:block min-w-6 min-h-6 text-[#daff00]" />
                            <div className="block lg:hidden absolute w-[1px] top-[2px] right-0 h-[calc(100%-4px)] bg-black/50"></div>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl backdrop-blur-lg bg-[#ffffff0d] border-none text-white">
                    <DropdownMenuItem className="rounded-2xl !text-white hover:bg-black/50 focus:bg-black/50 active:bg-black/50">
                        <Link href="/liquidity/manage" className="flex flex-row items-center gap-2"><Box className="w-6 h-6 text-[#daff00]" />MY LIQUIDITY</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-2xl !text-white hover:bg-black/50 focus:bg-black/50 active:bg-black/50">
                        <Link href="/liquidity/add" className="flex flex-row items-center gap-2"><PaintBucket className="w-6 h-6 text-[#daff00]" />ADD LIQUIDITY</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Link href="#" className="w-full lg:w-fit flex-1 lg:flex-auto">
                <div className="px-4 flex-1 w-full lg:w-36 py-2 lg:rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-col lg:flex-row items-center justify-start gap-2">
                    <ChartNoAxesCombined className="w-6 h-6 text-[#daff00]" />
                    ANALYTICS
                </div>
            </Link>
        </>
    )
}

export default function Header() {

    const activeWagmiAccount = useAccount();
    console.log("activeWagmiAccount", activeWagmiAccount.status)

    return (
        <>
            <section className="absolute top-0 flex flex-col items-center justify-center w-full">
                <div className={`${styles.header} aboslute text-white w-full top-0 h-24 flex flex-row px-6 items-center justify-between`}>

                    <div className="flex flex-1 flex-row items-center justify-start gap-2">
                        <Link href="/swap" className="w-full lg:w-fit flex-1 lg:flex-auto">
                            <Image src="/plyrswap.svg" alt="PLYR[SWAP]" width={100} height={100} className="w-12 h-12" />
                        </Link>
                    </div>

                    <div className="hidden lg:flex flex-row items-center justify-end lg:justify-center gap-2">
                        <NavList />
                    </div>

                    {
                        activeWagmiAccount.status === 'connected' && <div className="flex w-full flex-1 flex-row items-center justify-end gap-2">
                            <WalletButton />
                        </div>
                    }
                    {
                        activeWagmiAccount.status !== 'connected' && <div className="flex w-full flex-1 flex-row items-center justify-end gap-2">
                            <AccountDetail />
                        </div>
                    }
                    {/* <div className="hidden lg:flex w-full lg:flex-1 flex-row items-center justify-end gap-2">
                        <WalletButton />
                    </div> */}
                </div>
            </section>


            <section className={`${process.env.NEXT_PUBLIC_NETWORK_TYPE !== 'mainnet' ? 'bottom-5' : ''} flex lg:hidden fixed z-10 bottom-0 flex-col items-center justify-center w-full`}>
                <div className={`${styles.footerHeader} text-white w-full flex flex-row items-center justify-center`}>
                    <NavList />
                </div>
            </section>

            {/* <section className={`${process.env.NEXT_PUBLIC_NETWORK_TYPE !== 'mainnet' ? 'bottom-5' : ''} flex lg:hidden fixed z-10 bottom-0 flex-col items-center justify-center w-full`}>
                <div className={`${styles.footerHeader} z-10 text-white w-full h-16 flex flex-row px-6 items-center justify-center`}>
                    <WalletButton />
                </div>
            </section> */}
        </>
    )
}
