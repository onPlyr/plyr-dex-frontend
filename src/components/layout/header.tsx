"use client";
import styles from './header.module.scss';
import Image from 'next/image';
import { Settings } from 'lucide-react';
import WalletButton from '@/components/walletButton';

export default function Header() {
    return <section className="absolute top-0 flex flex-col items-center justify-center w-full">
        <div className={`${styles.header} aboslute text-white w-full top-0  h-16 flex flex-row px-6 items-center justify-between`}>
            <div className="flex flex-row items-center justify-center gap-2">
                <Image src="/logo/plyr_icon_white.svg" alt="PLYR CONNECT" width={100} height={100} className="w-8 h-8" />
                <div className="flex flex-col items-start justify-center">
                    <div className="text-2xl font-black leading-none" style={{ lineHeight: '20px' }}>PLYR</div>
                    <div className="text-[13px] font-light leading-none" style={{ lineHeight: '12px' }}>SWAP</div>
                </div>
            </div>

            <WalletButton />

        </div>
    </section>
}
