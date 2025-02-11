import { NotificationType, NotificationTypeMsg } from "@/app/types/notifications"
export const DefaultNotificationRemoveDelayMs = 4000 as const
export const DefaultNotificationTypeMsg: Record<NotificationType, NotificationTypeMsg> = {
    [NotificationType.SimulateError]: {
        header: "Simulation Error",
        body: "An unknown error occurred when simulating the transaction.",
    },
    [NotificationType.SimulateFailed]: {
        header: "Simulation Failed",
        body: "The transaction simulation failed.",
    },
    [NotificationType.Pending]: {
        header: "Confirm Transaction",
        body: "Please confirm the transaction in your wallet.",
    },
    [NotificationType.Submitted]: {
        header: "Transaction Pending",
        body: "Your transaction has been submitted and is now awaiting confirmation.",
    },
    [NotificationType.Success]: {
        header: "Success",
        body: "Your transaction has been completed successfully!",
    },
    [NotificationType.Reverted]: {
        header: "Transaction Reverted",
        body: "Your transaction was reverted and did not complete successfully.",
    },
    [NotificationType.Error]: {
        header: "Error",
        body: "An unknown error occurred when executing your transaction and it may not have completed successfully.",
    },
} as const