"use client"

import { ThirdwebProvider } from "thirdweb/react";

import { ReactNode, useEffect, useState } from "react"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { deserialize, serialize, WagmiProvider } from "wagmi"
import { hashFn } from "@wagmi/core/query"

import { wagmiConfig } from "@/app/config/wagmi"
import { AccountDataProvider } from "@/app/providers/accountData"
import FavouriteTokensProvider from "@/app/providers/favouriteTokens"
import PreferencesProvider from "@/app/providers/preferences"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            queryKeyHashFn: hashFn,
        },
    },
})

// todo: review provider nesting, may be a good idea to combine some and cut down on requests/queries

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

        <PreferencesProvider>
            <FavouriteTokensProvider>
                <ThirdwebProvider>
                    <WagmiProvider config={wagmiConfig}>
                        {persister && <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>

                            <AccountDataProvider>
                                {children}
                            </AccountDataProvider>

                            <ReactQueryDevtools initialIsOpen={false} />
                        </PersistQueryClientProvider>}
                    </WagmiProvider>
                </ThirdwebProvider>
            </FavouriteTokensProvider>
        </PreferencesProvider>

    )
}
