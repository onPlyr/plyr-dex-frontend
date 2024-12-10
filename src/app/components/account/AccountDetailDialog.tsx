"use client"

import Link from "next/link"
import * as React from "react"
import { useCallback, useState } from "react"
import { Address } from "viem"
import { useDisconnect } from "wagmi"

import AccountHistoryDetailDialog from "@/app/components/account/AccountHistoryDetailDialog"
import DisconnectIcon from "@/app/components/icons/DisconnectIcon"
import SwapIcon from "@/app/components/icons/SwapIcon"
import { TxIcon, TxIconVariant } from "@/app/components/icons/TxIcon"
import SwapStatusSelectItem from "@/app/components/swap/SwapStatusSelectItem"
import { TokenDetailItem } from "@/app/components/tokens/TokenDetailItem"
import Button from "@/app/components/ui/Button"
import { Dialog } from "@/app/components/ui/Dialog"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { SummaryDetailItem } from "@/app/components/ui/SummaryDetailItem"
import { TabContent, TabsContainer, TabsList, TabTrigger } from "@/app/components/ui/Tabs"
import { swapHistoryLocalStorageMsg } from "@/app/config/swaps"
import { DefaultTokenSortType } from "@/app/config/tokens"
import useAccountData from "@/app/hooks/account/useAccountData"
import useFavouriteTokens from "@/app/hooks/tokens/useFavouriteTokens"
import { getBlockExplorerLink } from "@/app/lib/chains"
import { toShort } from "@/app/lib/strings"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { Chain } from "@/app/types/chains"
import { sortTokens } from "@/app/lib/tokens"

export interface AccountDetailDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
    accountAddress?: Address,
    connectedChain?: Chain,
}

enum AccountDetailDialogTab {
    Balances = "balances",
    Transactions = "transactions",
}
const accountDetailDialogDefaultTab = AccountDetailDialogTab.Balances

// todo: complete account details/tx history
export const AccountDetailDialog = React.forwardRef<React.ElementRef<typeof Dialog>, AccountDetailDialogProps>(({
    trigger,
    header,
    accountAddress,
    connectedChain,
    side = "right",
    disabled = false,
    ...props
}, ref) => {

    // todo: tx history currently limited to 10 entries, add pagination/load more/infinite scrool type functionality to display more

    const [isOpen, setIsOpen] = useState<boolean>(false)

    const { balances: accountBalanceData, history: accountHistoryData } = useAccountData()
    const { data: tokenBalanceData } = accountBalanceData
    const { data: accountHistory } = accountHistoryData
    const { favouriteTokens } = useFavouriteTokens()
    const swapHistory = accountHistory.slice(0, 10)
    const tokensWithBalances = tokenBalanceData.filter((token) => token.balance !== undefined && token.balance > 0)
    const tokenData = sortTokens(tokensWithBalances, DefaultTokenSortType, favouriteTokens)

    const [activeTab, setActiveTab] = useState<AccountDetailDialogTab>(accountDetailDialogDefaultTab)
    const setTab = useCallback((tab: string) => {
        setActiveTab(tab && (Object.values(AccountDetailDialogTab) as string[]).includes(tab) ? tab as AccountDetailDialogTab : accountDetailDialogDefaultTab)
    }, [setActiveTab])

    const { disconnect } = useDisconnect()
    const disconnectAccount = useCallback(() => {
        disconnect()
        setIsOpen(false)
    }, [setIsOpen, disconnect])

    const accountExplorerUrl = getBlockExplorerLink({
        chain: connectedChain,
        address: accountAddress,
    })

    return accountAddress !== undefined && connectedChain !== undefined ? (
        <Dialog
            ref={ref}
            trigger={trigger}
            header={header}
            side={side}
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={disabled}
            {...props}
        >

            <SummaryDetailItem className="bg-transparent">
                <div className="flex flex-col flex-1 w-full gap-4">
                    <div className="flex flex-row flex-1">
                        <div className="flex flex-row flex-1 items-center font-bold text-xl gap-4">
                            {accountExplorerUrl ? (
                                <ExternalLink
                                    href={accountExplorerUrl}
                                    className="text-white"
                                >
                                    {toShort(accountAddress, 6)}
                                </ExternalLink>
                            ) : toShort(accountAddress, 6)}
                        </div>
                        <div className="flex flex-row flex-1 gap-4 justify-end">
                            <DisconnectIcon onClick={disconnectAccount} />
                        </div>
                    </div>
                    <div className="flex flex-row flex-1 font-bold text-xl text-muted-400">
                        Balance
                    </div>
                    <div className="flex flex-row flex-1 font-bold text-3xl">
                        $12,345,678.90
                    </div>
                </div>
            </SummaryDetailItem>

            <TabsContainer value={activeTab} onValueChange={(tab) => setTab(tab)}>
                <TabsList>
                    <TabTrigger value={AccountDetailDialogTab.Balances}>
                        Balances
                    </TabTrigger>
                    <TabTrigger value={AccountDetailDialogTab.Transactions}>
                        Transactions
                    </TabTrigger>
                </TabsList>
                <TabContent className="animate-tab-slide-in-out-left" value={AccountDetailDialogTab.Balances}>
                    {tokenData.map((token, i) => (
                        <TokenDetailItem
                            key={i}
                            token={token}
                        />
                    ))}
                </TabContent>
                <TabContent className="animate-tab-slide-in-out-right" value={AccountDetailDialogTab.Transactions}>
                    {swapHistory.length > 0 ? (<>
                        {swapHistory.map((history, i) => (
                            <AccountHistoryDetailDialog
                                key={i}
                                trigger=<SwapStatusSelectItem
                                    accountAddress={accountAddress}
                                    txid={history.id}
                                />
                                header={getRouteTypeLabel(history.type)}
                                history={history}
                            />
                        ))}
                        <div className="flex flex-row flex-1 pt-4 justify-center items-center font-bold text-sm text-muted-500 text-center">
                            {swapHistoryLocalStorageMsg}
                        </div>
                    </>) : (<>
                        <div className="flex flex-row flex-1 items-center gap-4 text-muted-500">
                            <TxIcon variant={TxIconVariant.Error} />
                            <span>No transactions found.</span>
                        </div>
                        <Link href="/swap">
                            <Button
                                className="mt-4 btn-gradient btn-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <span>Go to Swap</span>
                                <SwapIcon />
                            </Button>
                        </Link>
                    </>)}
                </TabContent>
            </TabsContainer>
        </Dialog>
    ) : <></>
})
AccountDetailDialog.displayName = "AccountDetailDialog"
