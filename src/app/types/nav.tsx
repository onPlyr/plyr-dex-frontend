// todo: tbc
export type NavLinkType = {
    name: string,
    path: `/${string}` | `https://${string}`,
    icon?: React.ReactNode,
    isExternal?: boolean,
    disabled?: boolean,
}
