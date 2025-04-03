"use client"

import { useMemo } from "react"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import { CurrencyIcon } from "@/app/components/icons/CurrencyIcon"
import SwapParameter from "@/app/components/swap/SwapParameter"
import TokenDetailItem, { TokenDetailAnimation } from "@/app/components/tokens/TokenDetailItem"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import Skeleton from "@/app/components/ui/Skeleton"
import { TokenPriceConfig } from "@/app/config/prices"
import { iconSizes } from "@/app/config/styling"
import useReadAvvyName from "@/app/hooks/avvy/useReadAvvyName"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useTokenFilters from "@/app/hooks/tokens/useTokenFilters"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getBlockExplorerLink, getChain } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { PageType } from "@/app/types/navigation"
import { PreferenceType } from "@/app/types/preferences"
import { isValidTokenAmount } from "@/app/types/tokens"

const AccountPage = () => {

    const { address: accountAddress, chainId } = useAccount()
    const connectedChain = chainId ? getChain(chainId) : undefined
    const { formattedName: avvyName } = useReadAvvyName({
        accountAddress: accountAddress,
    })

    const { getPreference } = usePreferences()
    const currency = getPreference(PreferenceType.Currency)
    const { tokens: allTokens, useBalancesData, useTokenPricesData } = useTokens()
    const { getBalance } = useBalancesData
    const { getAmountValue, isInProgress: priceIsInProgress } = useTokenPricesData

    const tokens = useMemo(() => allTokens.filter((token) => Boolean(getBalance(token)?.amount)), [allTokens, getBalance])
    const { filteredTokens } = useTokenFilters(tokens)

    const totalValue = tokens.reduce((sum, token) => {
        const balance = getBalance(token)
        const value = getAmountValue(token, balance)
        return sum + (isValidTokenAmount(value) ? value.amount : BigInt(0))
    }, BigInt(0))
    const totalValueFormatted = formatUnits(totalValue, TokenPriceConfig.Decimals)

    const displayAddress = accountAddress ? <>
        <span className="hidden sm:flex">{accountAddress}</span>
        <span className="flex sm:hidden">{toShort(accountAddress, 8, 6)}</span>
    </> : undefined

    const explorerUrl = getBlockExplorerLink({
        chain: connectedChain,
        address: accountAddress,
    })

    return (
        <Page
            key={PageType.Account}
            header="My Account"
            backUrl="/swap"
        >
            <ScaleInOut className="flex flex-col flex-none gap-4 w-full h-fit">
                {accountAddress ? (<>
                    <div className="container flex flex-col flex-1 p-4 gap-4">
                        <div className="flex flex-col flex-1 gap-1">
                            <div className="flex flex-row flex-1 gap-4 justify-between items-center">
                                <div className="flex flex-row flex-1 justify-start items-center font-bold">
                                    {avvyName ?? displayAddress}
                                </div>
                                {explorerUrl && (
                                    <div className="flex flex-row flex-none justify-end items-center">
                                        <ExternalLink
                                            href={explorerUrl}
                                            iconSize="sm"
                                        />
                                    </div>
                                )}
                            </div>
                            {avvyName && (
                                <div className="flex text-muted-500">
                                    {displayAddress}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                            <SwapParameter
                                icon=<CurrencyIcon
                                    currency={currency}
                                    className={iconSizes.sm}
                                />
                                label="Total balance"
                                value={priceIsInProgress ? (
                                    <Skeleton className="h-6 w-24" />
                                ) : (
                                    <CurrencyAmount
                                        amountFormatted={totalValueFormatted}
                                        currency={currency}
                                    />
                                )}
                                valueClass="font-mono text-base"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        {filteredTokens.map((token, i) => (
                            <TokenDetailAnimation
                                key={token.uid}
                                index={i}
                                numTokens={filteredTokens.length}
                            >
                                <TokenDetailItem
                                    token={token}
                                    className="container-select-transparent flex flex-row flex-1 p-4 gap-4 cursor-auto"
                                    replaceClass={true}
                                    isSelected={false}
                                />
                            </TokenDetailAnimation>
                        ))}
                    </div>
                </>) : (
                    <AlertDetail
                        type={AlertType.Info}
                        header="No Account Found"
                        msg="Please connect your wallet to view your account details."
                    />
                )}
            </ScaleInOut>
        </Page>
    )
}

export default AccountPage