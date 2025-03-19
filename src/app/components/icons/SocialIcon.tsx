import React from "react"
 import { twMerge } from "tailwind-merge"
 
 import { iconSizes, imgSizes } from "@/app/config/styling"
 import { SocialLinkData } from "@/app/types/navigation"
 import { StyleSize } from "@/app/types/styling"
 
 export interface SocialIconProps extends React.ComponentPropsWithoutRef<"div"> {
     socialData: SocialLinkData,
     iconSize?: StyleSize,
     imgSize?: StyleSize,
 }
 
 const SocialIcon = React.forwardRef<HTMLDivElement, SocialIconProps>(({
     className,
     socialData,
     iconSize,
     imgSize,
     ...props
 }, ref) => (
     <div
         ref={ref}
         className={twMerge(
             "inline-flex flex-row flex-none justify-center items-center aspect-square overflow-hidden",
             (iconSize && iconSizes[iconSize]) ?? (imgSize && imgSizes[imgSize]) ?? "w-full h-full",
             className,
         )}
         {...props}
     >
         {socialData.icon}
     </div>
 ))
 SocialIcon.displayName = "SocialIcon"
 
 export default SocialIcon