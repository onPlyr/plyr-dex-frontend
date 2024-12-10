export const slugify = (str: string) => {
    return str.replace(/[^0-9a-z-]/gi, "-").replace(/[-]+/g, "-").toLowerCase()
}

export const toShort = (str: string, chars?: number) => {
    return `${str.slice(0, chars ?? 4)}...${str.slice(chars ? -chars : -4)}`
}
