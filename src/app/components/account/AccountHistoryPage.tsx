"use client"

import Link from "next/link"
import { useAccount } from "wagmi"

import AccountHistoryDetailDialog from "@/app/components/account/AccountHistoryDetailDialog"
import SwapIcon from "@/app/components/icons/SwapIcon"
import { TxIcon, TxIconVariant } from "@/app/components/icons/TxIcon"
import Button from "@/app/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card"
import { swapHistoryLocalStorageMsg } from "@/app/config/swaps"
import useAccountData from "@/app/hooks/account/useAccountData"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import SwapStatusSelectItem from "../swap/SwapStatusSelectItem"

////////////////////////////////////////////////////////////////////////////////

// todo: add pagination, infinite scroll or similar for users with a large number of swaps
// todo: add search/filter for previous txs
// todo: add dialog/collapsible to show full tx details
// todo: add msg when no history found
// todo: show loading status
// todo: add msg about localstorage and losing history on browser close, clearing data, etc.

const AccountHistoryPage = () => {

    const { address: accountAddress } = useAccount()
    const { history: accountHistoryData } = useAccountData()
    const { data: accountHistory } = accountHistoryData

    // todo: add pagination/load more functionality to view older txs
    const swapHistory = accountHistory.slice(0, 10)

    return (
        <Card glow={true}>
            <CardHeader>
                <CardTitle>
                <div className="text-white text-4xl font-black leading-none" style={{ fontFamily: 'var(--font-road-rage)' }}>Transaction History</div>
                </CardTitle>
            </CardHeader>
            <CardContent>
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
                    <div className="flex flex-row flex-1 justify-center items-center font-bold text-sm text-muted-500 text-center">
                        {swapHistoryLocalStorageMsg}
                    </div>
                </>) : (<>
                    <div className="flex flex-row flex-1 items-center gap-4 text-muted-500">
                        <TxIcon variant={TxIconVariant.Error} />
                        <span>No transactions found.</span>
                    </div>
                    <Link href="/swap">
                        <Button className="btn-gradient btn-full">
                            <span>Go to Swap</span>
                            <SwapIcon />
                        </Button>
                    </Link>
                </>)}
            </CardContent>
        </Card>
    )
}

export default AccountHistoryPage
