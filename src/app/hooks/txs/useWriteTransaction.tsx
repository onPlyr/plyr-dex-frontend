import React, { useCallback, useEffect, useState } from "react"
import { Hash, toHex, TransactionReceipt, zeroAddress } from "viem"
import { useAccount, useSimulateContract, UseSimulateContractParameters, useWriteContract, UseWriteContractReturnType } from "wagmi"
import { waitForTransactionReceipt } from "@wagmi/core"

import { TxNotificationMsgs } from "@/app/config/txs"
import { wagmiConfig } from "@/app/config/wagmi"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { getChain } from "@/app/lib/chains"
import { getParsedError } from "@/app/lib/utils"
import { NotificationStatus, NotificationStatusType, NotificationType } from "@/app/types/notifications"
import { TxNotificationMsg, TxNotificationType } from "@/app/types/txs"

const defaultConfirmations = 1

type MsgData = {
    [key in TxNotificationType]?: TxNotificationMsg
}

type NotificationData = {
    type?: NotificationType,
    msgs?: MsgData,
}

type NotificationMsgs = Record<TxNotificationType, TxNotificationMsg>

const getTransactionNotificationData = (data?: MsgData) => {
    const msgs: MsgData = {}
    for (const type of Object.values(TxNotificationType)) {
        msgs[type] = {
            header: data?.[type]?.header ?? TxNotificationMsgs[type].header,
            body: data?.[type]?.body ?? TxNotificationMsgs[type].body,
            ignore: data?.[type]?.ignore ?? TxNotificationMsgs[type].ignore,
        }
    }
    return msgs as NotificationMsgs
}

type UseWriteTransactionReturnType = Omit<UseWriteContractReturnType, "writeContract" | "writeContractAsync"> & {
    writeTransaction: () => void,
    txReceipt?: TransactionReceipt,
    isInProgress: boolean,
}

const useWriteTransaction = ({
    params,
    confirmations,
    onConfirmation,
    notifications,
    _enabled = true,
}: {
    params: UseSimulateContractParameters,
    confirmations?: number,
    onConfirmation?: (receipt?: TransactionReceipt) => void,
    notifications?: NotificationData,
    _enabled?: boolean,
}): UseWriteTransactionReturnType => {

    const { setNotification } = useNotifications()
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
    const [txReceipt, setTxReceipt] = useState<TransactionReceipt>()
    const wagmiWriteContract = useWriteContract(params)

    const notificationType = notifications?.type ?? NotificationType.Transaction
    const notificationData = getTransactionNotificationData(notifications?.msgs)

    const setTransactionNotification = useCallback(({
        id,
        type,
        status,
        replaceBody,
        txHash,
    }: {
        id: Hash,
        type: TxNotificationType,
        status: NotificationStatusType,
        replaceBody?: React.ReactNode,
        txHash?: Hash,
    }) => {
        const { header, body, ignore } = notificationData[type]
        if (!ignore) {
            setNotification({
                id: id,
                type: notificationType,
                header: header,
                body: replaceBody ?? body,
                status: status,
                txHash: txHash,
            })
        }
    }, [setNotification, notificationType, notificationData])

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
        const notificationId = toHex(window.crypto.randomUUID())

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

            onConfirmation?.(txReceipt)
        }

        catch (err: unknown) {
            setTransactionNotification({
                id: notificationId,
                type: txReceipt?.status === "reverted" ? TxNotificationType.Reverted : TxNotificationType.Error,
                status: NotificationStatus.Error,
                replaceBody: err ? getParsedError(err) : undefined,
                txHash: txHash,
            })
        }

        finally {
            setIsInProgress(false)
        }

    }, [enabled, simulateData, setTransactionNotification, setTxReceipt, wagmiWriteContract.writeContractAsync, receiptConfirmations, onConfirmation, setIsInProgress])

    return {
        ...wagmiWriteContract,
        writeTransaction: writeTransaction,
        txReceipt: txReceipt,
        isInProgress: isInProgress,
    }
}

export default useWriteTransaction