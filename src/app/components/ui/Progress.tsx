"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { twMerge } from "tailwind-merge"

import CheckIcon from "@/app/components/icons/CheckIcon"
import ExternalLinkIcon from "@/app/components/icons/ExternalLinkIcon"
import LoadingIcon from "@/app/components/icons/LoadingIcon"
import ExternalLink from "@/app/components/ui/ExternalLink"
import { iconSizes } from "@/app/config/styling"

export interface ProgressCheckpointProps extends React.ComponentPropsWithoutRef<"div"> {
    position: number,
    value?: number,
    loadingIcon?: React.ReactNode,
    successIcon?: React.ReactNode,
    labelClass?: string,
    loadingLabel: string,
    successLabel: string,
    url?: string,
}

export const ProgressCheckpoint = React.forwardRef<HTMLDivElement, ProgressCheckpointProps>(({
    className,
    position,
    value,
    loadingIcon,
    successIcon,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    labelClass,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loadingLabel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    successLabel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    url,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={twMerge(
            "absolute -translate-x-1/2 p-2 rounded-full transition text-black",
            value && value >= position ? `bg-[#daff00] hover:bg-[#daff00] ${value >= 100 && "group-hover/indicator:bg-[#daff00]"}` : "bg-[#daff00] hover:bg-[#daff00]",
            className,
        )}
        style={{
            insetInlineStart: `${position}%`,
        }}
        {...props}
    >
        {value && value >= position ? (successIcon ?? <CheckIcon className={iconSizes.sm} />) : (loadingIcon ?? <LoadingIcon className={iconSizes.sm} />)}
    </div>
))
ProgressCheckpoint.displayName = "ProgressCheckpoint"

export const ProgressCheckpointLabel = React.forwardRef<HTMLDivElement, ProgressCheckpointProps>(({
    position,
    value,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loadingIcon,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    successIcon,
    labelClass,
    loadingLabel,
    successLabel,
    url,
    ...props
}, ref) => {
    const content = value && value >= position ? successLabel : loadingLabel
    return (
        <div
            ref={ref}
            className={twMerge(
                "flex flex-row absolute -translate-x-1/2 rounded-lg transition text-sm text-muted-400 hover:text-white bg-select-950/50 hover:bg-select-950/100",
                url ? undefined : "px-3 py-2",
                labelClass,
            )}
            style={{
                insetInlineStart: `${position}%`,
            }}
            {...props}
        >
            {url ? (
                <ExternalLink
                    href={url}
                    className="px-3 py-2 text-sm text-muted-400 hover:text-white"
                    hideIcon={true}
                >
                    {content}
                    <ExternalLinkIcon className={iconSizes.xs} />
                </ExternalLink>
            ) : content}
        </div>
    )
})
ProgressCheckpointLabel.displayName = "ProgressCheckpointLabel"

interface ProgressIndicatorProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Indicator> {
    value?: number,
}

export const ProgressIndicator = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Indicator>, ProgressIndicatorProps>(({
    className,
    value,
    ...props
}, ref) => (
    <ProgressPrimitive.Indicator
        ref={ref}
        className={twMerge(
            "flex flex-row w-full h-full rounded-full transition",
            value && value >= 100 ? "bg-[#daff00] group-hover/indicator:bg-[#daff00] paused" : "bg-[#daff00] animate-bg-wave running",
            className,
        )}
        style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
        }}
        {...props}
    />
))
ProgressIndicator.displayName = ProgressPrimitive.Indicator.displayName

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    indicatorContainerClass?: string,
    labelContainerClass?: string,
    indicator?: React.ReactNode,
    checkpoints?: ProgressCheckpointProps[],
}

export const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(({
    className,
    indicatorContainerClass,
    labelContainerClass,
    indicator,
    checkpoints,
    value,
    max = 100,
    getValueLabel,
    ...props
}, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={twMerge("group/container flex flex-col flex-1 w-full gap-4 justify-center", className)}
        value={value}
        max={max}
        getValueLabel={getValueLabel ? getValueLabel : value !== null && value !== undefined && checkpoints !== undefined && checkpoints.length !== 0 ? ((value) => {
            return checkpoints.findLast((checkpoint) => checkpoint.position <= value)?.successLabel ?? checkpoints[0].loadingLabel
        }) : undefined}
        {...props}
    >
        <div className="group/indicator flex flex-row flex-1 w-full relative items-center">
            <div className={twMerge("flex flex-row flex-1 w-full h-2 relative rounded-full overflow-hidden transition bg-select-950/50 border border-transparent", indicatorContainerClass)}>
                {indicator ?? <ProgressIndicator value={value ?? undefined} />}
            </div>
            {checkpoints?.map((checkpoint, i) => (
                <ProgressCheckpoint
                    key={i}
                    value={value ?? undefined}
                    {...checkpoint}
                />
            ))}
        </div>
        {checkpoints && (
            <div className={twMerge("flex flex-row flex-1 w-full mt-1 min-h-8 relative items-start", labelContainerClass)}>
                {checkpoints.map((checkpoint, i) => (
                    <ProgressCheckpointLabel
                        key={i}
                        value={value ?? undefined}
                        {...checkpoint}
                    />
                ))}
            </div>
        )}
    </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName
