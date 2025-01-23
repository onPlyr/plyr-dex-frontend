import { Address, erc20Abi, TransactionReceipt } from "viem"

import useWriteTransaction from "@/app/hooks/txs/useWriteTransaction"
import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

const useWriteApprove = ({
    chain,
    token,
    spenderAddress,
    amount,
    onConfirmation,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    spenderAddress?: Address,
    amount?: bigint,
    onConfirmation?: (receipt?: TransactionReceipt) => void,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && chain !== undefined && token !== undefined && token.isNative !== true && spenderAddress !== undefined && amount !== undefined && amount > 0

    const { data: txHash, txReceipt, status, writeTransaction, isInProgress } = useWriteTransaction({
        params: {
            chainId: chain?.id,
            address: token?.address,
            abi: erc20Abi,
            functionName: "approve",
            args: [spenderAddress, amount],
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

export default useWriteApprove
