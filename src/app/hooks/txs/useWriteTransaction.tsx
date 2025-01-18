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
}

const useWriteTransaction = ({
    params,
    confirmations,
    _enabled = true,
}: {
    params: UseSimulateContractParameters,
    confirmations?: number,
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

    const { data: simulateData, error: simulateError, failureReason: simulateFailureReason } = useSimulateContract({
        ...params,
        query: {
            ...params.query,
            enabled: enabled,
        },
    })
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
                    // msg: `An error occurred when simulating the transaction: ${simulateError.message}`,
                    msg: getParsedError(simulateError),
                    type: TxMsgType.Error,
                }
            }
            else if (simulateFailureReason) {
                msgData = {
                    header: "Simulation Failed",
                    // msg: `The transaction simulation failed with the following reason: ${simulateFailureReason.message}`,
                    msg: getParsedError(simulateFailureReason),
                    type: TxMsgType.Error,
                }
            }
            else if (simulateData === undefined) {
                msgData = {
                    header: "Unknown Simulation Error",
                    msg: "The transaction simulation failed to return any data.",
                    type: TxMsgType.Error,
                }
            }
        }

        setSimulateMsg(msgData)

    }, [enabled, simulateError, simulateFailureReason, simulateData])

    useEffect(() => {
        if (simulateMsg && !simulateMsg.isMsgOnly) {
            console.log(`useWriteTransaction simulateMsg: ${simulateMsg.msg}`)
            addToast({
                header: simulateMsg.header,
                description: simulateMsg.msg,
            })
        }
    }, [simulateMsg])

    const writeTransaction = useCallback(async () => {

        let txHash: Hash | undefined = undefined

        if (enabled && simulateData && !simulateMsg) {

            try {

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

                const receipt = await waitForTransactionReceipt(wagmiConfig, {
                    chainId: simulateData.request.chainId,
                    hash: txHash,
                    confirmations: receiptConfirmations,
                })
                setTxReceipt(receipt)

                if (receipt.status === "reverted") {
                    throw new Error("Transaction Reverted")
                }

                setTxMsg({
                    header: "Transaction Complete",
                    msg: "Your transaction has completed successfully.",
                    type: TxMsgType.Success,
                })
            }

            catch (err: unknown) {
                setTxMsg({
                    header: txReceipt && txReceipt.status === "reverted" ? "Transaction Reverted" : "Error Executing Transaction",
                    msg: getParsedError(err),
                    type: TxMsgType.Error,
                })
            }
        }

    }, [enabled, simulateMsg, simulateData, setTxMsg, setTxReceipt, wagmiWriteContract.writeContractAsync, receiptConfirmations])

    useEffect(() => {
        if (txMsg) {
            console.log(`useWriteTransaction txMsg: ${txMsg.msg}`)
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
    }
}

export default useWriteTransaction
