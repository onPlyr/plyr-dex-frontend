"use client"

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit"
import { useCallback, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { useAccount, useSwitchChain } from "wagmi"

import { AccountButton } from "@/app/components/account/AccountButton"
import { AccountDetailDialog } from "@/app/components/account/AccountDetailDialog"
import ConnectButton from "@/app/components/account/ConnectButton"
import { SelectChainDialog } from "@/app/components/chains/SelectChainDialog"
import { ErrorButton } from "@/app/components/ui/ErrorButton"
import { getChain, isSupportedChain } from "@/app/lib/chains"
import { Chain } from "@/app/types/chains"

const AccountDetail = () => {

    const { switchChain } = useSwitchChain()
    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const [connectedChain, setConnectedChain] = useState<Chain>()

    useEffect(() => {
        setConnectedChain(connectedChainId && isSupportedChain(connectedChainId) ? getChain(connectedChainId) : undefined)
    }, [connectedChainId])

    const switchConnectedChain = useCallback((chain?: Chain) => {
        if (chain) {
            switchChain({
                chainId: chain.id,
            })
        }
    }, [switchChain])

    return (
        <RainbowConnectButton.Custom>
            {({ account, chain, mounted }) => {
                const rainbowKitChain = chain
                const connected = mounted && account !== undefined && rainbowKitChain !== undefined && accountAddress !== undefined
                return (
                    <div className={twMerge("w-fit", !mounted && "hidden")}>
                        {!connected ? (
                             <ConnectButton className="ThirdwebWalletBtn text-white !px-8"/>
                        ) : rainbowKitChain.unsupported ? (
                            <SelectChainDialog
                                trigger=<ErrorButton>
                                    Unsupported Chain
                                </ErrorButton>
                                header="Switch Connected Chain"
                                setSelectedChain={switchConnectedChain}
                            />
                        ) : connectedChain && (<></>
                            // <div className="flex flex-row shrink gap-4">
                            //     <AccountDetailDialog
                            //         trigger=<AccountButton
                            //             account={account}
                            //             accountAddress={accountAddress}
                            //         />
                            //         header="Account"
                            //         accountAddress={accountAddress}
                            //         connectedChain={connectedChain}

                            //     />
                            // </div>
                        )}
                    </div>
                )
            }}
        </RainbowConnectButton.Custom>
    )
}

export default AccountDetail
