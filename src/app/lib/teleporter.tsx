import { TeleporterMessengerAddress, TeleporterVersion } from "@/app/types/teleporter"

export const getTeleporterMessengerAddress = (version?: TeleporterVersion) => {
    return TeleporterMessengerAddress[version ?? TeleporterVersion.Default]
}
