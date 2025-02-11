import { Address, zeroAddress } from "viem"

import { SwapStatus } from "@/app/config/swaps"
import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { getCellAbi } from "@/app/lib/cells"
import { getRouteInstructions } from "@/app/lib/routes"
import { getRouteTypeLabel } from "@/app/lib/swaps"
import { getTxActionMsg } from "@/app/lib/txs"
import { getStatusLabel } from "@/app/lib/utils"
import { Chain } from "@/app/types/chains"
import { NotificationType } from "@/app/types/notifications"
import { Route, RouteType } from "@/app/types/swaps"
import { TxAction, TxNotificationType } from "@/app/types/txs"

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
    const routeType = route ? getRouteTypeLabel(route.type) : "Transaction"

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
        notifications: {
            type: NotificationType.Swap,
            msgs: enabled ? {
                [TxNotificationType.Pending]: {
                    header: `Confirm ${routeType}`,
                    body: `${routeType} to ${route.dstToken.symbol} on ${route.dstChain.name}.`
                },
                [TxNotificationType.Submitted]: {
                    header: `${routeType} ${getStatusLabel(SwapStatus.Pending)}`,
                    body: `${getTxActionMsg(route.type === RouteType.Bridge ? TxAction.Transfer : TxAction.Swap, true)} to ${route.dstToken.symbol} on ${route.dstChain.name}.`,
                },
                [TxNotificationType.Success]: {
                    ignore: true,
                },
            } : undefined,
        },
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
