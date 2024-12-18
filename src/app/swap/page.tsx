"use client";

import SwapPage from "@/app/components/swap/SwapPage";
import "@/app/styles/globals.css"

export default function Main() {
    
    return (
        <>
            <div className="flex w-full max-w-3xl mx-auto flex-col items-center pt-[6.5rem] justify-center pb-24 lg:pb-12">
                <SwapPage />
            </div>
        </>
    );
}
