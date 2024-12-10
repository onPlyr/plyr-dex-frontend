import { CurrencyBtc, CurrencyCircleDollar, CurrencyCny, CurrencyDollar, CurrencyDollarSimple, CurrencyEth, CurrencyEur, CurrencyGbp, CurrencyInr, CurrencyJpy, CurrencyKrw, CurrencyKzt, CurrencyNgn, CurrencyRub } from "@phosphor-icons/react"
import * as React from "react"

import { BaseIcon } from "@/app/components/icons/BaseIcon"

export enum CurrencyIconVariant {
    Btc = "btc",
    Eth = "eth",
    Usd = "usd",
    UsdCircle = "usdCircle",
    UsdSimple = "usdSimple",
    Gbp = "gbp",
    Eur = "eur",
    Cny = "cny",
    Inr = "inr",
    Jpy = "jpy",
    Krw = "krw",
    Kzt = "kzt",
    Ngn = "ngn",
    Rub = "rub",
}

const currencyVariants: Record<CurrencyIconVariant, React.ReactNode> = {
    [CurrencyIconVariant.Btc]: <CurrencyBtc />,
    [CurrencyIconVariant.Eth]: <CurrencyEth />,
    [CurrencyIconVariant.Usd]: <CurrencyDollar />,
    [CurrencyIconVariant.UsdCircle]: <CurrencyCircleDollar />,
    [CurrencyIconVariant.UsdSimple]: <CurrencyDollarSimple />,
    [CurrencyIconVariant.Gbp]: <CurrencyGbp />,
    [CurrencyIconVariant.Eur]: <CurrencyEur />,
    [CurrencyIconVariant.Cny]: <CurrencyCny />,
    [CurrencyIconVariant.Inr]: <CurrencyInr />,
    [CurrencyIconVariant.Jpy]: <CurrencyJpy />,
    [CurrencyIconVariant.Krw]: <CurrencyKrw />,
    [CurrencyIconVariant.Kzt]: <CurrencyKzt />,
    [CurrencyIconVariant.Ngn]: <CurrencyNgn />,
    [CurrencyIconVariant.Rub]: <CurrencyRub />,
}

export interface CurrencyIconProps extends React.ComponentPropsWithoutRef<typeof BaseIcon> {
    variant: CurrencyIconVariant,
}

export const CurrencyIcon = React.forwardRef<React.ElementRef<typeof BaseIcon>, CurrencyIconProps>(({
    children,
    variant,
    ...props
}, ref) => {
    return (
        <BaseIcon
            ref={ref}
            {...props}
        >
            {children ?? currencyVariants[variant]}
        </BaseIcon>
    )

})
CurrencyIcon.displayName = "CurrencyIcon"
