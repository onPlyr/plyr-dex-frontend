import { Minus, MinusCircle, MinusSquare } from "@phosphor-icons/react"
 import React from "react"
 
 import { BaseIcon } from "@/app/components/icons/BaseIcon"
 
 export const MinusIconVariant = {
     Default: "default",
     Square: "square",
     Circle: "circle",
 } as const
 export type MinusIconVariant = (typeof MinusIconVariant)[keyof typeof MinusIconVariant]
 
 const minusIcons: Record<MinusIconVariant, React.ReactNode> = {
     [MinusIconVariant.Default]: <Minus />,
     [MinusIconVariant.Square]: <MinusSquare />,
     [MinusIconVariant.Circle]: <MinusCircle />,
 }
 
 interface MinusIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
     variant?: MinusIconVariant,
 }
 
 const MinusIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, MinusIconProps>(({
     children,
     variant,
     ...props
 }, ref) => (
     <BaseIcon
         ref={ref}
         {...props}
     >
         {children ?? minusIcons[variant ?? MinusIconVariant.Default]}
     </BaseIcon>
 ))
 MinusIcon.displayName = "MinusIcon"
 
 export default MinusIcon