import { Address, erc20Abi } from "viem"

import { ApproveNotificationType, NotificationBody, NotificationHeader } from "@/app/components/notifications/Approve"
import useWriteTransaction, { WriteTransactionCallbacks } from "@/app/hooks/txs/useWriteTransaction"
import { Chain } from "@/app/types/chains"
import { NotificationType } from "@/app/types/notifications"
import { isNativeToken, Token } from "@/app/types/tokens"

const getNotificationData = (token: Token, amount: bigint, type: ApproveNotificationType) => {
    return {
        header: <NotificationHeader
            token={token}
            type={type}
        />,
        body: <NotificationBody
            token={token}
            amount={amount}
            type={type}
        />,
    }
}

const useWriteApprove = ({
    chain,
    token,
    spenderAddress,
    amount,
    callbacks,
    _enabled = true,
}: {
    chain?: Chain,
    token?: Token,
    spenderAddress?: Address,
    amount?: bigint,
    callbacks?: WriteTransactionCallbacks,
    _enabled?: boolean,
}) => {

    const enabled = !(!_enabled || !chain || !token || isNativeToken(token) || !spenderAddress || !amount || amount === BigInt(0))
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
        callbacks: callbacks,
        notifications: enabled ? {
            [NotificationType.Pending]: getNotificationData(token, amount, NotificationType.Pending),
            [NotificationType.Submitted]: getNotificationData(token, amount, NotificationType.Submitted),
            [NotificationType.Success]: getNotificationData(token, amount, NotificationType.Success),
        } : undefined,
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
