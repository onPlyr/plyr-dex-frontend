import * as React from "react"

import ErrorDetail from "@/app/components/ui/ErrorDetail"

const AccountNotFoundError = React.forwardRef<React.ElementRef<typeof ErrorDetail>, React.ComponentPropsWithoutRef<"div">>(({
    ...props
}, ref) => (
    <ErrorDetail
        ref={ref}
        header="Error: Account Not Found"
        msg="Please connect your wallet to view your account details."
        {...props}
    />
))
AccountNotFoundError.displayName = "AccountNotFoundError"

export default AccountNotFoundError
