"use client";

import "@/app/styles/globals.css"

import AccountHistoryPage from "../components/account/AccountHistoryPage";

export default function Main() {
    return (
        <>
            <div className="flex w-full max-w-3xl mx-auto flex-col items-center justify-center pt-[6.5rem] pb-24 lg:pb-12">
                <AccountHistoryPage />
            </div>
        </>
    );
}
