import React, { useCallback, useEffect, useState } from "react"
import { Hash, TransactionReceipt, zeroAddress } from "viem"
import { useAccount, useSimulateContract, UseSimulateContractParameters, useWriteContract, UseWriteContractReturnType } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"

import { DefaultTxNotificationMsgData } from "@/app/config/txs"
import { wagmiConfig } from "@/app/config/wagmi"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { getChain } from "@/app/lib/chains"
import { getParsedError } from "@/app/lib/utils"
import { NotificationStatus, NotificationType } from "@/app/types/notifications"
import { TxNotificationMsg, TxNotificationType } from "@/app/types/txs"

const defaultConfirmations = 1

type WriteTransactionMsgData = {
    [key in TxNotificationType]?: TxNotificationMsg
}

export interface WriteTransactionNotificationData {
    type?: NotificationType,
    msgs?: WriteTransactionMsgData,
}

interface UseWriteTransactionReturnType extends Omit<UseWriteContractReturnType, "writeContract" | "writeContractAsync"> {
    writeTransaction: () => void,
    txReceipt?: TransactionReceipt,
    isInProgress: boolean,
    refetch: () => void,
}

export type WriteTransactionCallbackType = (receipt?: TransactionReceipt, notificationId?: string, txHash?: Hash) => void
export interface WriteTransactionCallbacks {
    onSuccess?: WriteTransactionCallbackType,
    onError?: WriteTransactionCallbackType,
    onSettled?: WriteTransactionCallbackType,
}

const useWriteTransaction = ({
    params,
    confirmations,
    callbacks,
    notifications,
    _enabled = true,
}: {
    params: UseSimulateContractParameters,
    confirmations?: number,
    callbacks?: WriteTransactionCallbacks,
    notifications?: WriteTransactionNotificationData,
    _enabled?: boolean,
}): UseWriteTransactionReturnType => {

    const { setNotification } = useNotifications()
    const { address: accountAddress, chainId: connectedChainId } = useAccount()
    const connectedChain = connectedChainId ? getChain(connectedChainId) : undefined
    const txChain = params.chainId ? getChain(params.chainId) : undefined
    const receiptConfirmations = confirmations || defaultConfirmations
    const enabled = _enabled !== false && params.query?.enabled !== false && accountAddress !== undefined && connectedChain !== undefined && txChain !== undefined && connectedChain.id === txChain.id

    const { data: simulateData, status: simulateStatus, error: simulateError, failureReason: simulateFailureReason, refetch } = useSimulateContract({
        ...params,
        query: {
            ...params.query,
            enabled: enabled,
        },
    })
    const [isInProgress, setIsInProgress] = useState(false)
    const [txReceipt, setTxReceipt] = useState<TransactionReceipt>()
    const wagmiWriteContract = useWriteContract(params)

    const setTransactionNotification = useCallback(({
        id,
        type,
        status,
        replaceBody,
        txHash,
    }: {
        id: string,
        type: TxNotificationType,
        status: NotificationStatus,
        replaceBody?: React.ReactNode,
        txHash?: Hash,
    }) => {
        const msgData = notifications?.msgs?.[type]
        if (!msgData?.ignore) {
            setNotification({
                id: id,
                type: notifications?.type ?? NotificationType.Transaction,
                header: msgData?.header ?? DefaultTxNotificationMsgData[type].header,
                body: replaceBody ?? msgData?.body ?? DefaultTxNotificationMsgData[type].body,
                status: status,
                txHash: txHash,
            })
        }
    }, [setNotification, notifications, simulateData])

    useEffect(() => {
        if (enabled) {
            if (simulateFailureReason) {
                setTransactionNotification({
                    id: zeroAddress,
                    type: TxNotificationType.SimulateFailed,
                    status: NotificationStatus.Error,
                    replaceBody: getParsedError(simulateFailureReason),
                })
            }
            else if (simulateError || (simulateStatus !== "pending" && simulateData === undefined)) {
                setTransactionNotification({
                    id: zeroAddress,
                    type: TxNotificationType.SimulateError,
                    status: NotificationStatus.Error,
                    replaceBody: simulateError ? getParsedError(simulateError) : undefined,
                })
            }
        }
    }, [enabled, simulateError, simulateFailureReason, simulateStatus, simulateData])

    const writeTransaction = useCallback(async () => {

        let txHash: Hash | undefined = undefined
        let txReceipt: TransactionReceipt | undefined = undefined
        const notificationId = window.crypto.randomUUID()

        if (!enabled || !simulateData) {
            return
        }

        try {

            setIsInProgress(true)
            setTransactionNotification({
                id: notificationId,
                type: TxNotificationType.Pending,
                status: NotificationStatus.Pending,
            })

            txHash = await wagmiWriteContract.writeContractAsync(simulateData.request)
            setTransactionNotification({
                id: notificationId,
                type: TxNotificationType.Submitted,
                status: NotificationStatus.Pending,
                txHash: txHash,
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

            setTransactionNotification({
                id: notificationId,
                type: TxNotificationType.Success,
                status: NotificationStatus.Success,
                txHash: txHash,
            })

            callbacks?.onSuccess?.(txReceipt, notificationId, txHash)
        }

        catch (err: unknown) {
            setTransactionNotification({
                id: notificationId,
                type: txReceipt?.status === "reverted" ? TxNotificationType.Reverted : TxNotificationType.Error,
                status: NotificationStatus.Error,
                replaceBody: err ? getParsedError(err) : undefined,
                txHash: txHash,
            })
            callbacks?.onError?.(txReceipt, notificationId, txHash)
        }

        finally {
            setIsInProgress(false)
            callbacks?.onSettled?.(txReceipt, notificationId, txHash)
        }

    }, [enabled, callbacks, simulateData, setTransactionNotification, setTxReceipt, wagmiWriteContract.writeContractAsync, receiptConfirmations, setIsInProgress])

    return {
        ...wagmiWriteContract,
        writeTransaction: writeTransaction,
        txReceipt: txReceipt,
        isInProgress: isInProgress,
        refetch: refetch,
    }
}

export default useWriteTransaction