import { QueryStatus } from "@tanstack/react-query"
import { RouteSortType, RouteType, TeleporterMessengerContractData, TeleporterMessengerVersion } from "@/app/types/swaps"

// defaults
export const defaultMinGasPrice = BigInt(25)
export const defaultGasPriceExponent = 9

// todo: tmp values, tbc
export const tmpGasBuffer = BigInt(500000)
export const tmpHopGasEstimate = BigInt(500000)
export const tmpMaxSteps = BigInt(2)

// todo: tmp values, tbc
// all bps values
// export const tmpTeleporterFee = BigInt(100)
export const tmpTeleporterFee = BigInt(0)
export const tmpSecondaryTeleporterFee = BigInt(0)
export const tmpRollbackTeleporterFee = BigInt(0)
export const tmpSwapSlippage = BigInt(500)
export const tmpYakSwapFee = BigInt(0)

export const defaultSlippageBps = 10
export const slippageBpsOptions = [
    defaultSlippageBps,
    50,
    100,
]
export const defaultSlippagePercent = (defaultSlippageBps / 100).toString()
export const slippagePercentOptions = slippageBpsOptions.map((num) => (num / 100).toString())

export const minSlippageBps = 0
export const maxSlippageBps = 10000

export const tokenInputBalancePercentOptions = [
    25,
    50,
    100,
]

// note: deployed address is the same across all evm chains, see below for info and addresses
// https://github.com/ava-labs/teleporter#deployed-addresses
export const teleporterMessengerContracts: TeleporterMessengerContractData = {
    "v1.0.0": "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
}
export const supportedTeleporterMessengerVersion: TeleporterMessengerVersion = "v1.0.0"

// interval in milliseconds
export const swapStatusPollIntervalMs = 4000
export const swapStatusPollNumRefetches = 3

export const routeTypeLabels: Record<RouteType, string> = {
    [RouteType.Swap]: "Swap",
    [RouteType.Bridge]: "Bridge",
}
export const swapStatusMessages: Record<QueryStatus, string> = {
    pending: "Pending",
    success: "Completed",
    error: "Error",
}

export const durationEstimateNumConfirmations = 3

export const defaultRouteSortType = RouteSortType.Amount

export const swapHistoryLocalStorageMsg = "Transaction history is saved locally and will be erased when you clear your browser cache."

export const defaultDstTokenId = "usdc"
