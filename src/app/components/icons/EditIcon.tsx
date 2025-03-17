import { Pencil } from "@phosphor-icons/react"
 import React from "react"
 
 import { BaseIcon, BaseIconProps } from "@/app/components/icons/BaseIcon"
 
 const EditIcon = React.forwardRef<React.ComponentRef<typeof BaseIcon>, BaseIconProps>(({
     children,
     ...props
 }, ref) => (
     <BaseIcon
         ref={ref}
         {...props}
     >
         {children ?? <Pencil />}
     </BaseIcon>
 ))
 EditIcon.displayName = "EditIcon"
 
 export default EditIcon