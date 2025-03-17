import { StyleSize } from "@/app/types/styling"

export const imgSizes: Record<StyleSize, string> = {
    xs: "w-6 min-w-6 max-w-6 h-6 min-h-6 max-h-6",
    sm: "w-8 min-w-8 max-w-8 h-8 min-h-8 max-h-8",
    default: "w-10 min-w-10 max-w-10 h-10 min-h-10 max-h-10",
    lg: "w-12 min-w-12 max-w-12 h-12 min-h-12 max-h-12",
    xl: "w-16 min-w-16 max-w-16 h-16 min-h-16 max-h-16",
}

export const iconSizes: Record<StyleSize, string> = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
}

export const MediaQueries = {
    XsBreakpoint: "(min-width: 480px)",
    SmBreakpoint: "(min-width: 640px)",
} as const