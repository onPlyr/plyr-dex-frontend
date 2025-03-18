"use client"

import "@/app/styles/globals.css"

import { useAccount } from "wagmi"

import ScaleInOut from "@/app/components/animations/ScaleInOut"
import SlideInOut from "@/app/components/animations/SlideInOut"
import { ChartIcon, ChartIconVariant } from "@/app/components/icons/ChartIcon"
import { CurrencyIcon } from "@/app/components/icons/CurrencyIcon"
import SwapParameter from "@/app/components/swap/SwapParameter"
import { TokenDetailItem } from "@/app/components/tokens/TokenDetailItem"
import AlertDetail, { AlertType } from "@/app/components/ui/AlertDetail"
import CurrencyAmount from "@/app/components/ui/CurrencyAmount"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { Page } from "@/app/components/ui/Page"
import { defaultCurrency } from "@/app/config/numbers"
import { iconSizes } from "@/app/config/styling"
import useReadAvvyName from "@/app/hooks/avvy/useReadAvvyName"
import usePreferences from "@/app/hooks/preferences/usePreferences"
import useFavouriteTokens from "@/app/hooks/tokens/useFavouriteTokens"
import useTokens from "@/app/hooks/tokens/useTokens"
import { getBlockExplorerLink, getChain } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { sortTokens } from "@/app/lib/tokens"
import { PageType } from "@/app/types/navigation"
import { PreferenceType } from "@/app/types/preferences"
import { TokenSortType } from "@/app/types/tokens"

const AccountPage = () => {

    const { address: accountAddress, chainId } = useAccount()
    const connectedChain = chainId ? getChain(chainId) : undefined
    const { formattedName: avvyName } = useReadAvvyName({
        accountAddress: accountAddress,
    })

    const { preferences } = usePreferences()
    const { data: tokenData } = useTokens()
    const { favouriteTokens } = useFavouriteTokens()
    const tokens = sortTokens(tokenData.filter((token) => token.balance && token.balance > 0), TokenSortType.BalanceValue, favouriteTokens)
    // const totalValue = tokens.reduce((sum, token) => token.value ? sum + token.value : sum, BigInt(0))
    // const maxBalanceToken = sortTokens(tokens, TokenSortType.BalanceValue)[0]
    const currency = preferences[PreferenceType.Currency] ?? defaultCurrency

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
                                icon=<CurrencyIcon currency={currency} className={iconSizes.sm} />
                                label="Total balance"
                                value=<CurrencyAmount
                                    amountFormatted="12345678.90"
                                    // amount={totalValue}
                                    currency={currency}
                                    className="font-mono text-base"
                                />
                            />
                            <SwapParameter
                                icon=<ChartIcon variant={ChartIconVariant.TrendUp} className={iconSizes.sm} />
                                label="Largest balance"
                                value=<CurrencyAmount
                                    amountFormatted="123456"
                                    // amount={maxBalanceToken.value}
                                    currency={currency}
                                    className="font-mono text-base"
                                />
                            />
                            {/*<SwapParameter
                                icon=<CurrencyIcon variant={CurrencyIconVariant.UsdCircle} className={iconSizes.sm} />
                                label="Token amount"
                                value=<>
                                    <DecimalAmount
                                        amountFormatted={maxBalanceToken.balanceFormatted}
                                        symbol={maxBalanceToken.symbol}
                                        token={maxBalanceToken}
                                        className="font-mono text-base"
                                    />
                                    <TokenImage
                                        token={maxBalanceToken}
                                        className={imgSizes.xs}
                                    />
                                </>
                                valueClass="gap-4 font-mono font-normal text-muted-400"
                            />*/}
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 gap-1">
                        {tokens.map((token, i) => (
                            <SlideInOut
                                key={`${token.chainId}-${token.id}`}
                                from="left"
                                to="right"
                                delays={{
                                    animate: i * 0.05,
                                    exit: (tokens.length - 1 - i) * 0.05,
                                }}
                            >
                                <TokenDetailItem
                                    token={token}
                                    isSelected={false}
                                    className="container-select-transparent flex flex-row flex-1 p-4 gap-4"
                                    replaceClass={true}
                                />
                            </SlideInOut>
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
