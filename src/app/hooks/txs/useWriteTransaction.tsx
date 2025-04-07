import React, { useCallback, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Abi, Address, Hash, TransactionReceipt } from "viem"
import { UseSimulateContractParameters, useSwitchChain, useWriteContract, UseWriteContractReturnType } from "wagmi"
import { getAccount, getChainId, serialize, simulateContract, waitForTransactionReceipt } from "@wagmi/core"

import { DefaultNotificationTypeMsg } from "@/app/config/notifications"
import { wagmiConfig } from "@/app/config/wagmi"
import useNotifications from "@/app/hooks/notifications/useNotifications"
import { getChain } from "@/app/lib/chains"
import { getParsedError } from "@/app/lib/utils"
import { ChainId, isSupportedChainId } from "@/app/types/chains"
import { NotificationStatus, NotificationType, NotificationTypeData } from "@/app/types/notifications"

const defaultConfirmations = 1

interface UseWriteTransactionReturnType extends Omit<UseWriteContractReturnType, "writeContract" | "writeContractAsync"> {
    writeTransaction: () => void,
    txReceipt?: TransactionReceipt,
    isInProgress: boolean,
}

export type WriteTransactionCallbackType = (receipt?: TransactionReceipt, notificationId?: string, txHash?: Hash) => void
export interface WriteTransactionCallbacks {
    onSuccess?: WriteTransactionCallbackType,
    onError?: WriteTransactionCallbackType,
    onSettled?: WriteTransactionCallbackType,
}

interface TransactionParams<TChainId = number | ChainId> {
    chainId?: TChainId,
    account?: Address,
    address?: Address,
    abi?: Abi,
    functionName?: string,
    queryDisabled?: boolean,
}
type ValidTransactionParams = Required<TransactionParams<ChainId>>

const isValidTransactionParams = (params: TransactionParams): params is ValidTransactionParams => {
    return !(!params.chainId || !isSupportedChainId(params.chainId) || !params.account || !params.address || !params.abi || !params.functionName)
}

const getTransactionParamsErrorMsg = (params: TransactionParams) => {

    const errors: string[] = []

    if (!params.chainId) {
        errors.push("chainId: missing value")
    }
    else if (!isSupportedChainId(params.chainId)) {
        errors.push(`chainId: unsupported chain (${params.chainId})`)
    }

    if (!params.account) {
        errors.push("account: missing value")
    }

    if (!params.address) {
        errors.push("address: missing value")
    }

    if (!params.abi) {
        errors.push("abi: missing value")
    }

    if (!params.functionName) {
        errors.push("functionName: missing value")
    }

    if (params.queryDisabled) {
        errors.push("query: disabled")
    }

    return errors.length > 0 ? `Invalid Parameters: ${errors.join(" / ")}` : undefined
}

const useWriteTransaction = ({
    params,
    confirmations,
    callbacks,
    notifications,
    notificationId,
    _enabled = true,
}: {
    params: UseSimulateContractParameters,
    confirmations?: number,
    callbacks?: WriteTransactionCallbacks,
    notifications?: NotificationTypeData,
    notificationId?: string,
    _enabled?: boolean,
}): UseWriteTransactionReturnType => {

    const { setNotification } = useNotifications()
    const { switchChainAsync } = useSwitchChain()
    const receiptConfirmations = confirmations || defaultConfirmations

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
        type: NotificationType,
        status: NotificationStatus,
        replaceBody?: React.ReactNode,
        txHash?: Hash,
    }) => {
        const data = notifications?.[type]
        if (!data?.ignore) {
            setNotification({
                id: id,
                type: type,
                header: data?.header ?? DefaultNotificationTypeMsg[type].header,
                body: replaceBody ?? data?.body ?? DefaultNotificationTypeMsg[type].body,
                status: status,
                txHash: txHash,
            })
        }
    }, [setNotification, notifications])

    const writeTransaction = useCallback(async () => {

        let txHash: Hash | undefined = undefined
        let txReceipt: TransactionReceipt | undefined = undefined
        let errType: NotificationType | undefined = undefined

        const useNotificationId = notificationId || uuidv4()

        try {

            setIsInProgress(true)
            setTransactionNotification({
                id: useNotificationId,
                type: NotificationType.Pending,
                status: NotificationStatus.Pending,
            })

            const account = getAccount(wagmiConfig)
            if (!account.address) {
                throw new Error("No account connected.")
            }

            const txParams: TransactionParams = {
                chainId: params.chainId,
                account: params.account ? params.account as Address : account.address,
                address: params.address,
                abi: params.abi,
                functionName: params.functionName,
                queryDisabled: !_enabled || params.query?.enabled === false,
            }

            const wagmiChainId = getChainId(wagmiConfig)
            const connectorChainId = await account.connector?.getChainId()

            if (!isValidTransactionParams(txParams)) {
                errType = NotificationType.SimulateError
                throw new Error(getTransactionParamsErrorMsg(txParams))
            }

            if (account.chainId !== txParams.chainId || wagmiChainId !== txParams.chainId || !connectorChainId || connectorChainId !== txParams.chainId || !isSupportedChainId(connectorChainId)) {
                await switchChainAsync({
                    chainId: txParams.chainId,
                }, {
                    onError: (err) => {
                        throw new Error(getParsedError(err))
                    }
                })
            }

            const txChain = getChain(txParams.chainId)
            if (!txChain) {
                throw new Error(`Error connecting to chain: ${txParams.chainId}.`)
            }

            const simulateData = await simulateContract(wagmiConfig, {
                chainId: txChain.id,
                account: txParams.account,
                address: txParams.address,
                abi: txParams.abi,
                functionName: txParams.functionName,
                args: params.args,
                value: params.value,
            })

            txHash = await wagmiWriteContract.writeContractAsync(simulateData.request)
            setTransactionNotification({
                id: useNotificationId,
                type: NotificationType.Submitted,
                status: NotificationStatus.Pending,
                txHash: txHash,
            })

            txReceipt = await waitForTransactionReceipt(wagmiConfig, {
                chainId: txChain.id,
                hash: txHash,
                confirmations: receiptConfirmations,
            })
            setTxReceipt(txReceipt)

            if (txReceipt.status === "reverted") {
                errType = NotificationType.Reverted
                throw new Error("Transaction reverted")
            }

            setTransactionNotification({
                id: useNotificationId,
                type: NotificationType.Success,
                status: NotificationStatus.Success,
                txHash: txHash,
            })

            callbacks?.onSuccess?.(txReceipt, useNotificationId, txHash)
        }

        catch (err: unknown) {
            setTransactionNotification({
                id: useNotificationId,
                type: errType ?? NotificationType.Error,
                status: NotificationStatus.Error,
                replaceBody: err ? getParsedError(err) : undefined,
                txHash: txHash,
            })
            callbacks?.onError?.(txReceipt, useNotificationId, txHash)
            console.warn(`useWriteTransaction error: ${serialize(err)}`)
        }

        finally {
            setIsInProgress(false)
            callbacks?.onSettled?.(txReceipt, useNotificationId, txHash)
        }

    }, [params, callbacks, notificationId, _enabled, switchChainAsync, setTransactionNotification, setTxReceipt, wagmiWriteContract, receiptConfirmations, setIsInProgress])

    return {
        ...wagmiWriteContract,
        writeTransaction: writeTransaction,
        txReceipt: txReceipt,
        isInProgress: isInProgress,
    }
}

export default useWriteTransaction