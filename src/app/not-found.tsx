"use client"
import Link from 'next/link'
import Image from 'next/image'
import BoldySwap from "@/public/boldy/BoldySwap.png"
import "@/app/styles/globals.css"
import Button from './components/ui/Button'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <Image src={BoldySwap} alt="Boldy Swap" width={400} height={400} className="w-full h-full max-w-[300px] max-h-[300px] object-contain" />
            <h2 className="text-white text-4xl font-bold">404 Not Found</h2>

            <Button
                label="My Account"
                className="btn gradient-btn"
                replaceClass={true}
            >
                <Link href="/swap">
                    Back to Swap
                </Link>
            </Button>
        </div>
    )
}