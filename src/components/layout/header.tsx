"use client";
import Link from 'next/link';
import styles from './header.module.scss';
import Image from 'next/image';
import { ChartBar, ChartCandlestick, ChartNoAxesCombined, CircleDollarSign, History, Settings } from 'lucide-react';
import WalletButton from '@/components/walletButton';

export default function Header() {
    return <section className="absolute top-0 flex flex-col items-center justify-center w-full">
        <div className={`${styles.header} aboslute text-white w-full top-0  h-16 flex flex-row px-6 items-center justify-between`}>

            <div className="flex flex-1 flex-row items-center justify-start gap-2">
                <Image src="/plyrswap.svg" alt="PLYR[SWAP]" width={100} height={100} className="w-12 h-12" />

            </div>

            <div className="flex flex-1 flex-row items-center justify-center gap-2">
                <Link href="/swap">
                    <div className="px-4 w-32 py-2 rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-row items-center justify-start gap-2">
                        <ChartCandlestick className="w-6 h-6 text-[#daff00]" />
                        SWAP
                    </div>
                </Link>
                <Link href="/history">
                    <div className="px-4 w-32 py-2 rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-row items-center justify-start gap-2">
                        <History className="w-6 h-6 text-[#daff00]" />
                        HISTORY
                    </div>
                </Link>
                <Link href="/liquidity/manage">
                    <div className="px-4 w-32 py-2 rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-row items-center justify-start gap-2">
                        <CircleDollarSign className="w-6 h-6 text-[#daff00]" />
                        LIQUIDITY
                    </div>
                </Link>
                <Link href="#">
                    <div className="px-4 w-32 py-2 rounded-3xl bg-[#ffffff10] text-white text-xs flex flex-row items-center justify-start gap-2">
                        <ChartNoAxesCombined className="w-6 h-6 text-[#daff00]" />
                        ANALYTICS
                    </div>
                </Link>
            </div>

            <div className="flex flex-1 flex-row items-center justify-end gap-2">
                <WalletButton />
            </div>
        </div>
    </section>
}
