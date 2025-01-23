import { Address } from "viem"

import { depositWithdrawNativeAbi } from "@/app/config/abis"
import useWriteTransaction from "@/app/hooks/txs/useWriteTransaction"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

const useWriteWithdrawNative = ({
    connectedChain,
    accountAddress,
    token,
    amount,
    onConfirmation,
    _enabled = true,
}: {
    connectedChain?: Chain,
    accountAddress?: Address,
    token?: Token,
    amount?: bigint,
    onConfirmation?: () => void,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && connectedChain !== undefined && accountAddress !== undefined && token !== undefined && token.isNative === true && token.wrappedAddress !== undefined && amount !== undefined && amount > BigInt(0) && connectedChain.id === token.chainId

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: connectedChain?.id,
            account: accountAddress,
            address: token?.wrappedAddress,
            abi: depositWithdrawNativeAbi,
            functionName: "withdraw",
            args: [amount || BigInt(0)],
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

export default useWriteWithdrawNative
