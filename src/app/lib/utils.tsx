import { QueryStatus } from "@tanstack/react-query"

import ErrorIcon from "@/app/components/icons/ErrorIcon"
import { iconSizes } from "@/app/config/styling"
import { statusLabels } from "@/app/config/txs"

export const isEqualObj = (objA?: object, objB?: object) => {
    if (objA === undefined && objB === undefined) {
        return undefined
    }
    else if (objA === undefined || objB === undefined) {
        return false
    }
    return (Object.keys(objA) as (keyof typeof objA)[]).every((key) => objA[key] === objB[key])
}

export const getStatusLabel = (status: QueryStatus) => {
    return statusLabels[status]
}

export const getErrorToastData = ({
    header,
    description,
}: {
    header?: React.ReactNode,
    description: React.ReactNode,
}) => {
    return {
        header: <div className="flex flex-row flex-1 gap-4 text-error-500">
            <ErrorIcon className={iconSizes.sm} />
            <span>{header ?? "Error"}</span>
        </div>,
        description: description,
    }
}
