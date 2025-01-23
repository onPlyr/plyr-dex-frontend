import React, { useCallback, useEffect, useState } from "react"
import { Hash, TransactionReceipt } from "viem"
import { useAccount, useSimulateContract, UseSimulateContractParameters, useWriteContract, UseWriteContractReturnType } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"

import { wagmiConfig } from "@/app/config/wagmi"
import useToast from "@/app/hooks/toast/useToast"
import { getChain } from "@/app/lib/chains"
import { getParsedError } from "@/app/lib/utils"

const defaultConfirmations = 1

enum TxMsgType {
    Success = "success",
    Info = "info",
    Error = "error",
}

interface TxMsg {
    header: React.ReactNode,
    msg: React.ReactNode,
    type: TxMsgType,
    isMsgOnly?: boolean,
}

type UseWriteTransactionReturnType = Omit<UseWriteContractReturnType, "writeContract" | "writeContractAsync"> & {
    writeTransaction: () => void,
    txReceipt?: TransactionReceipt,
    simulateMsg?: TxMsg,
    txMsg?: TxMsg,
    isInProgress: boolean,
}

const useWriteTransaction = ({
    params,
    confirmations,
    onConfirmation,
    _enabled = true,
}: {
    params: UseSimulateContractParameters,
    confirmations?: number,
    onConfirmation?: (receipt?: TransactionReceipt) => void,
    _enabled?: boolean,
}): UseWriteTransactionReturnType => {

    // todo: replace generic toasts with specific tx status component
    // todo: add tx name / description or similar to pass to hook and display in messages

    const { addToast } = useToast()
    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined
    const txChain = params.chainId ? getChain(params.chainId) : undefined
    const receiptConfirmations = confirmations || defaultConfirmations
    const enabled = _enabled !== false && params.query?.enabled !== false && accountAddress !== undefined && connectedChain !== undefined && txChain !== undefined && connectedChain.id === txChain.id

    const { data: simulateData, status: simulateStatus, error: simulateError, failureReason: simulateFailureReason } = useSimulateContract({
        ...params,
        query: {
            ...params.query,
            enabled: enabled,
        },
    })
    const [isInProgress, setIsInProgress] = useState(false)
    const [simulateMsg, setSimulateMsg] = useState<TxMsg>()
    const [txMsg, setTxMsg] = useState<TxMsg>()
    const [txReceipt, setTxReceipt] = useState<TransactionReceipt>()
    const wagmiWriteContract = useWriteContract(params)

    useEffect(() => {

        let msgData: TxMsg | undefined = undefined

        if (enabled) {
            if (simulateError) {
                msgData = {
                    header: "Simulation Error",
                    msg: getParsedError(simulateError),
                    type: TxMsgType.Error,
                }
            }
            else if (simulateFailureReason) {
                msgData = {
                    header: "Simulation Failed",
                    msg: getParsedError(simulateFailureReason),
                    type: TxMsgType.Error,
                }
            }
            else if (simulateStatus !== "pending" && simulateData === undefined) {
                msgData = {
                    header: "Unknown Simulation Error",
                    msg: "The transaction simulation failed to return any data.",
                    type: TxMsgType.Error,
                }
            }
        }

        setSimulateMsg(msgData)

    }, [enabled, simulateError, simulateFailureReason, simulateStatus, simulateData])

    useEffect(() => {
        if (simulateMsg && !simulateMsg.isMsgOnly) {
            addToast({
                header: simulateMsg.header,
                description: simulateMsg.msg,
            })
        }
    }, [simulateMsg])

    const writeTransaction = useCallback(async () => {

        let txHash: Hash | undefined = undefined
        let txReceipt: TransactionReceipt | undefined = undefined

        if (!enabled || !simulateData || simulateMsg) {
            return
        }

        try {

            setIsInProgress(true)
            setTxMsg({
                header: "Awaiting User Confirmation",
                msg: "Please confirm the transaction in your wallet.",
                type: TxMsgType.Info,
            })

            txHash = await wagmiWriteContract.writeContractAsync(simulateData.request)

            setTxMsg({
                header: "Transaction Submitted",
                msg: "Awaiting confirmation that the transaction has completed.",
                type: TxMsgType.Info,
            })

            txReceipt = await waitForTransactionReceipt(wagmiConfig, {
                chainId: simulateData.request.chainId,
                hash: txHash,
                confirmations: receiptConfirmations,
            })
            setTxReceipt(txReceipt)

            if (txReceipt.status === "reverted") {
                throw new Error("Transaction Reverted")
            }

            setTxMsg({
                header: "Transaction Complete",
                msg: "Your transaction has completed successfully.",
                type: TxMsgType.Success,
            })

            onConfirmation?.(txReceipt)
        }

        catch (err: unknown) {
            setTxMsg({
                header: txReceipt && txReceipt.status === "reverted" ? "Transaction Reverted" : "Error Executing Transaction",
                msg: getParsedError(err),
                type: TxMsgType.Error,
            })
        }

        finally {
            setIsInProgress(false)
        }

    }, [enabled, simulateMsg, simulateData, setTxMsg, setTxReceipt, wagmiWriteContract.writeContractAsync, receiptConfirmations, onConfirmation, setIsInProgress])

    useEffect(() => {
        if (txMsg) {
            addToast({
                header: txMsg.header,
                description: txMsg.msg,
            })
        }
    }, [txMsg])

    return {
        ...wagmiWriteContract,
        writeTransaction: writeTransaction,
        txReceipt: txReceipt,
        simulateMsg: simulateMsg,
        txMsg: txMsg,
        isInProgress: isInProgress,
    }
}

export default useWriteTransaction
