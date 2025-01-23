export type StyleSideX = "left" | "right"
export type StyleSideY = "top" | "bottom"
export type StyleSide = StyleSideX | StyleSideY
export type StyleSize = "xs" | "sm" | "default" | "lg" | "xl"
export enum StyleDirection {
    Left = "left",
    Right = "right",
    Up = "up",
    Down = "down",
}
export enum StyleToggleDirection {
    UpDown = "upDown",
    LeftRight = "leftRight",
}
export enum StyleShape {
    Circle = "circle",
    Square = "square",
}
export type IconFormat = "png" | "svg"

export type ColourHex = `#${string}`
export interface ColourDefinition {
    DEFAULT?: ColourHex,
    50?: ColourHex,
    100?: ColourHex,
    200?: ColourHex,
    300?: ColourHex,
    400?: ColourHex,
    500?: ColourHex,
    600?: ColourHex,
    700?: ColourHex,
    800?: ColourHex,
    900?: ColourHex,
    950?: ColourHex,
}
