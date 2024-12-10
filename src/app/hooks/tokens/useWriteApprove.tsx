import { useCallback, useEffect } from "react"
import { Address, erc20Abi } from "viem"
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi"

import { Chain } from "@/app/types/chains"
import { Token } from "@/app/types/tokens"

const useWriteApprove = ({
    chain,
    token,
    spenderAddress,
    amount,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    spenderAddress?: Address,
    amount?: bigint,
    _enabled?: boolean,
}) => {

    const enabled = _enabled !== false && chain !== undefined && token !== undefined && token.isNative !== true && spenderAddress !== undefined && amount !== undefined && amount > 0

    const { data } = useSimulateContract({
        chainId: chain?.id,
        address: token?.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress!, amount!],
        query: {
            enabled: enabled,
        },
    })

    const { data: txHash, status, writeContract } = useWriteContract()
    const write = useCallback(() => {
        if (data !== undefined) {
            writeContract(data.request)
        }
    }, [data, writeContract])

    const { data: txReceipt, failureReason, status: txReceiptStatus } = useWaitForTransactionReceipt({
        hash: txHash,
        onReplaced: replacement => console.log(`useWriteApprove::replacement`, replacement),
        query: {
            enabled: txHash !== undefined,
            retry: false // See https://github.com/wevm/wagmi/issues/3674
        }
    })

    useEffect(() => {
        if (failureReason !== null) {
            console.log(`useWriteApprove::failureReason`, failureReason)
        }
    }, [failureReason])

    // const addRecentTransaction = useAddRecentTransaction()

    // useEffect(() => {
    //     if (txHash !== undefined) {
    //         addRecentTransaction({
    //             hash: txHash,
    //             description,
    //         })
    //     }
    // }, [txHash, addRecentTransaction, description])

    useEffect(() => {
        if (txReceipt === undefined) {
            return
        }
        console.log(`useWriteApprove::txReceipt`, txReceipt)
    // }, [txReceipt, description])
    }, [txReceipt])

    return {
        status,
        write,
        txHash,
        txReceipt,
        txReceiptStatus,
    }
}

export default useWriteApprove
