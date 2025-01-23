import { Address, TransactionReceipt, zeroAddress } from "viem"

import { cellAbi } from "@/app/config/abis"
import useWriteTransaction from "@/app/hooks/txs/useWriteTransaction"
import { getRouteInstructions } from "@/app/lib/routes"
import { Chain } from "@/app/types/chains"
import { Route } from "@/app/types/swaps"

const useWriteInitiateSwap = ({
    connectedChain,
    accountAddress,
    route,
    onConfirmation,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    route?: Route,
    onConfirmation?: (receipt?: TransactionReceipt) => void,
    _enabled?: boolean,
}) => {

    const instructions = getRouteInstructions(accountAddress, route)
    const enabled = _enabled !== false && connectedChain !== undefined && accountAddress !== undefined && route !== undefined && route.initiateTx === undefined && instructions !== undefined && connectedChain.id === route.srcChain.id

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: route?.srcChain.id,
            account: accountAddress,
            address: route?.srcCell.address,
            // todo: come back to this, univ2 cell doesn't seem to accept value
            // abi: route?.srcCell.abi,
            abi: cellAbi,
            functionName: "initiate",
            args: [route?.srcToken.address || zeroAddress, route?.srcAmount || BigInt(0), instructions!],
            value: route?.srcToken.isNative ? route?.srcAmount : undefined,
            query: {
                enabled: enabled,
            },
        },
        onConfirmation: onConfirmation,
        _enabled: enabled,
    })

    return {
        write: writeTransaction,
        txHash: txHash,
        txReceipt: txReceipt,
        status: status,
        isInProgress: isInProgress,
    }
}

export default useWriteInitiateSwap
