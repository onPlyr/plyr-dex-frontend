"use client"

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { ReactNode, useEffect, useState } from "react"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { deserialize, serialize, WagmiProvider } from "wagmi"
import { hashFn } from "@wagmi/core/query"

import { ThirdwebProvider } from "thirdweb/react";
import { TooltipProvider } from "@/app/components/ui/Tooltip"
import { wagmiConfig } from "@/app/config/wagmi"
import ApiDataProvider from "@/app/providers/ApiDataProvider"
import NotificationProvider from "@/app/providers/NotificationProvider"
import PreferencesProvider from "@/app/providers/PreferencesProvider"
import QuoteDataProvider from "@/app/providers/QuoteDataProvider"
import SwapHistoryProvider from "@/app/providers/SwapHistoryProvider"
import TokenDataProvider from "@/app/providers/TokenDataProvider"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            queryKeyHashFn: hashFn,
        },
    },
})

const ApiDataProviders = ({ children }: { children: ReactNode }) => (
    <ApiDataProvider>
        {children}
    </ApiDataProvider>
)

const UiDataProviders = ({ children }: { children: ReactNode }) => (
    <TooltipProvider>
        <NotificationProvider>
            {children}
        </NotificationProvider>
    </TooltipProvider>
)

const StoredDataProviders = ({ children }: { children: ReactNode }) => (
    <PreferencesProvider>
        {children}
    </PreferencesProvider>
)

const QueryDataProviders = ({ children }: { children: ReactNode }) => (
    <TokenDataProvider>
        <QuoteDataProvider>
            <SwapHistoryProvider>
                {children}
            </SwapHistoryProvider>
        </QuoteDataProvider>
    </TokenDataProvider>
)

// todo: review provider nesting

export const Providers = ({ children }: { children: ReactNode }) => {

    const [persister, setPersister] = useState<Persister | undefined>()
    useEffect(() => {
        const x = createSyncStoragePersister({
            serialize,
            storage: window.localStorage,
            deserialize,
        })
        setPersister(x)
    }, [])

    return (
        <UiDataProviders>
            <StoredDataProviders>
                <ThirdwebProvider>
                    <WagmiProvider config={wagmiConfig}>
                        {persister && <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
                            <RainbowKitProvider showRecentTransactions={true} theme={darkTheme()}>
                                <ApiDataProviders>
                                    <QueryDataProviders>
                                        {children}
                                    </QueryDataProviders>
                                </ApiDataProviders>
                            </RainbowKitProvider>
                            <ReactQueryDevtools initialIsOpen={false} />
                        </PersistQueryClientProvider>}
                    </WagmiProvider>
                </ThirdwebProvider>
            </StoredDataProviders>
        </UiDataProviders>
    )
}
