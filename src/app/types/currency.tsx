import { BaseNumberFormatOptions } from "@/app/types/numbers"
 
 export const Currency = {
     USD: "usd",
     EUR: "eur",
     GBP: "gbp",
 } as const
 export type Currency = (typeof Currency)[keyof typeof Currency]
 
 export const CurrencyLabel: Record<Currency, string> = {
     [Currency.USD]: "USD",
     [Currency.EUR]: "EUR",
     [Currency.GBP]: "GBP",
 } as const
 
 const BaseCurrencyFormatOptions: Intl.NumberFormatOptions = {
     ...BaseNumberFormatOptions,
     style: "currency",
     currencyDisplay: "narrowSymbol",
     minimumFractionDigits: 2,
     maximumFractionDigits: 2,
 } as const
 
 const SmFormatOptions: Intl.NumberFormatOptions = {
     minimumSignificantDigits: 2,
     maximumSignificantDigits: 2,
 }
 
 export const CurrencyFormatOptions: Record<Currency, Intl.NumberFormatOptions> = {
     [Currency.USD]: {
         ...BaseCurrencyFormatOptions,
         currency: Currency.USD,
     },
     [Currency.EUR]: {
         ...BaseCurrencyFormatOptions,
         currency: Currency.EUR,
     },
     [Currency.GBP]: {
         ...BaseCurrencyFormatOptions,
         currency: Currency.GBP,
     },
 } as const
 export type CurrencyFormatOptions = (typeof CurrencyFormatOptions)[keyof typeof CurrencyFormatOptions]
 
 export const SmCurrencyFormatOptions: Record<Currency, Intl.NumberFormatOptions> = {
     [Currency.USD]: {
         ...CurrencyFormatOptions[Currency.USD],
         ...SmFormatOptions,
     },
     [Currency.EUR]: {
         ...CurrencyFormatOptions[Currency.EUR],
         ...SmFormatOptions,
     },
     [Currency.GBP]: {
         ...CurrencyFormatOptions[Currency.GBP],
         ...SmFormatOptions,
     },
 } as const
 export type SmCurrencyFormatOptions = (typeof SmCurrencyFormatOptions)[keyof typeof SmCurrencyFormatOptions]
 
 export const CurrencyFormat: Record<Currency, Intl.NumberFormat> = {
     [Currency.USD]: new Intl.NumberFormat(undefined, CurrencyFormatOptions[Currency.USD]),
     [Currency.EUR]: new Intl.NumberFormat(undefined, CurrencyFormatOptions[Currency.EUR]),
     [Currency.GBP]: new Intl.NumberFormat(undefined, CurrencyFormatOptions[Currency.GBP]),
 } as const
 export type CurrencyFormat = (typeof CurrencyFormat)[keyof typeof CurrencyFormat]
 
 export const SmCurrencyFormat: Record<Currency, Intl.NumberFormat> = {
     [Currency.USD]: new Intl.NumberFormat(undefined, SmCurrencyFormatOptions[Currency.USD]),
     [Currency.EUR]: new Intl.NumberFormat(undefined, SmCurrencyFormatOptions[Currency.EUR]),
     [Currency.GBP]: new Intl.NumberFormat(undefined, SmCurrencyFormatOptions[Currency.GBP]),
 } as const
 export type SmCurrencyFormat = (typeof SmCurrencyFormat)[keyof typeof SmCurrencyFormat]
 
 export const CurrencyFormatLimit = {
     Default: 1,
 } as const
 export type CurrencyFormatLimit = (typeof CurrencyFormatLimit)[keyof typeof CurrencyFormatLimit]