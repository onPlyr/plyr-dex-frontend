import { Address, zeroAddress } from "viem"

import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { getCellAbi } from "@/app/lib/cells"
import { getRouteInstructions } from "@/app/lib/routes"
import { getTxActionLabel } from "@/app/lib/txs"
import { Chain } from "@/app/types/chains"
import { NotificationType } from "@/app/types/notifications"
import { Route, RouteType } from "@/app/types/swaps"
import { TxAction, TxLabelType } from "@/app/types/txs"
import { amountToLocale } from "@/app/lib/numbers"

const useWriteInitiateSwap = ({
    connectedChain,
    accountAddress,
    destinationAddress,
    route,
    callbacks,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    destinationAddress?: Address,
    route?: Route,
    callbacks?: WriteTransactionCallbacks,
    _enabled?: boolean,
}) => {

    const abi = getCellAbi(route?.srcCell)
    const instructions = getRouteInstructions((destinationAddress ? destinationAddress : accountAddress), route)
    const enabled = !(!_enabled || !connectedChain || !accountAddress || !route || !abi || route.initiateTx || !instructions || connectedChain.id !== route.srcChain.id)
    const action = route?.type === RouteType.Bridge ? TxAction.Transfer : TxAction.Swap

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress, refetch } = useWriteTransaction({
        params: {
            chainId: route?.srcChain.id,
            account: accountAddress,
            address: route?.srcCell.address,
            abi: abi,
            functionName: "initiate",
            args: [route?.srcToken.address || zeroAddress, route?.srcAmount || BigInt(0), instructions!],
            value: route?.srcToken.isNative ? route?.srcAmount : undefined,
            query: {
                enabled: enabled,
            },
        },
        callbacks: callbacks,
        notifications: enabled ? {
            [NotificationType.Pending]: {
                header: `Confirm ${getTxActionLabel(action, TxLabelType.Default)}`,
                body: `From ${route.type === RouteType.Bridge ? route.srcChain.name : amountToLocale(route.srcAmount, route.srcToken.decimals)} ${route.srcToken.symbol} to ${route.type === RouteType.Bridge ? route.dstChain.name : amountToLocale(route.dstAmount, route.dstToken.decimals)} ${route.dstToken.symbol}.`
            },
            [NotificationType.Submitted]: {
                header: `${getTxActionLabel(action, TxLabelType.InProgress)} ${amountToLocale(route.srcAmount, route.srcToken.decimals)} ${route.srcToken.symbol}`,
                body: `To ${route.type === RouteType.Bridge ? route.dstChain.name : amountToLocale(route.dstAmount, route.dstToken.decimals)} ${route.dstToken.symbol}.`,
            },
            [NotificationType.Success]: {
                ignore: true,
            },
        } : undefined,
        _enabled: enabled,
    })

    return {
        write: writeTransaction,
        txHash: txHash,
        txReceipt: txReceipt,
        status: status,
        isInProgress: isInProgress,
        refetch: refetch,
    }
}

export default useWriteInitiateSwap
