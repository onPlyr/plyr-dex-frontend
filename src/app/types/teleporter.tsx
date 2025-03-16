export const TeleporterVersion = {
    Default: "v1.0.0",
} as const
export type TeleporterVersion = (typeof TeleporterVersion)[keyof typeof TeleporterVersion]

export const TeleporterMessengerAddress = {
    [TeleporterVersion.Default]: "0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf",
} as const
export type TeleporterMessengerAddress = (typeof TeleporterMessengerAddress)[keyof typeof TeleporterMessengerAddress]

export const TeleporterFee = {
    Primary: BigInt(0),
    Secondary: BigInt(0),
    Rollback: BigInt(0),
} as const
export type TeleporterFee = (typeof TeleporterFee)[keyof typeof TeleporterFee]
