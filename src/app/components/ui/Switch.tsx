import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { twMerge } from "tailwind-merge"

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
    pressed: boolean,
    setPressed: (pressed: boolean) => void,
    thumbStyle?: string,
    disabled?: boolean,
}

export const Switch = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, SwitchProps>(({
    pressed,
    setPressed,
    className,
    thumbStyle,
    disabled,
    ...props
}, ref) => (
    <TogglePrimitive.Root
        ref={ref}
        className={twMerge("group relative flex flex-row w-14 h-7 p-1 justify-start items-center transition rounded-full bg-input-950/0 data-[state=on]:bg-[#daff00] data-[state=off]:bg-[#3A3935]", className)}
        pressed={pressed}
        onPressedChange={setPressed}
        disabled={disabled}
        {...props}
    >
        <div className={twMerge("w-5 h-5 absolute left-1 aspect-square rounded-full overflow-hidden bg-white group-data-[state=on]:bg-[#3A3935] [transition:left_150ms_linear] group-data-[state=on]:left-8 group-data-[state=off]:left-1", thumbStyle)} />
    </TogglePrimitive.Root>
))
Switch.displayName = TogglePrimitive.Root.displayName
