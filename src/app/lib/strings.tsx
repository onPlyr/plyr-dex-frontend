export const slugify = (str: string) => {
    return str.replace(/[^0-9a-z-]/gi, "-").replace(/[-]+/g, "-").toLowerCase() as Lowercase<string>
}

export const toShort = (str: string, charsStart?: number, charsEnd?: number) => {
    return `${str.slice(0, charsStart ?? 6)}...${str.slice(charsEnd ? -charsEnd : -4)}`
}
