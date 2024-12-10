import { PlatformId, Platforms } from "@/app/config/platforms"

export const getPlatform = (id?: string) => {
    return id && Object.keys(Platforms).includes(id) ? Platforms[id as PlatformId] : undefined
}
