import { Address, TransactionReceipt, zeroAddress } from "viem"

import useWriteTransaction from "@/app/hooks/txs/useWriteTransaction"
import { getCellAbi } from "@/app/lib/cells"
import { getRouteInstructions } from "@/app/lib/routes"
import { Chain } from "@/app/types/chains"
import { Route } from "@/app/types/swaps"

const useWriteInitiateSwap = ({
    connectedChain,
    accountAddress,
    destinationAddress,
    route,
    onConfirmation,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    destinationAddress?: Address,
    route?: Route,
    onConfirmation?: (receipt?: TransactionReceipt) => void,
    _enabled?: boolean,
}) => {

    const abi = getCellAbi(route?.srcCell)
    const instructions = getRouteInstructions((destinationAddress ? destinationAddress : accountAddress), route)
    const enabled = _enabled !== false && connectedChain !== undefined && accountAddress !== undefined && route !== undefined && abi !== undefined && route.initiateTx === undefined && instructions !== undefined && connectedChain.id === route.srcChain.id

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
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
