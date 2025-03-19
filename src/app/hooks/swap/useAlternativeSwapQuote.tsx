import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
 
 import Button from "@/app/components/ui/Button"
 import DecimalAmount from "@/app/components/ui/DecimalAmount"
 import { SwapQuoteConfig } from "@/app/config/swaps"
 import useNotifications from "@/app/hooks/notifications/useNotifications"
 import useQuoteData from "@/app/hooks/quotes/useQuoteData"
 import useInterval from "@/app/hooks/utils/useInterval"
 import { formatDuration } from "@/app/lib/datetime"
 import { NotificationStatus, NotificationType } from "@/app/types/notifications"
 import { SwapQuote } from "@/app/types/swaps"
 
 const useAlternativeSwapQuote = ({
     quote,
     setQuote,
 }: {
     quote?: SwapQuote,
     setQuote: Dispatch<SetStateAction<SwapQuote | undefined>>,
 }) => {
 
     const { selectedQuote } = useQuoteData()
     const { setNotification, removeNotification } = useNotifications()
     const [alternativeQuote, setAlternativeQuote] = useState<SwapQuote>()
     const [intervalMs, setIntervalMs] = useState(0)
     const [countdownMs, setCountdownMs] = useState<number>(SwapQuoteConfig.AlternativeQuoteSwitchDelayMs)
 
     useEffect(() => {
 
         const isAlternative = !!quote && !!selectedQuote && selectedQuote.estDstAmount > quote.estDstAmount
         const isExpired = !!quote && !!selectedQuote && selectedQuote.estDstAmount < quote.estDstAmount
 
         if (isExpired) {
             setQuote(selectedQuote)
             setNotification({
                 id: `expired-${quote.id}`,
                 type: NotificationType.Success,
                 header: `Quote Updated`,
                 body: `Best available quote selected after previous quote expired.`,
                 status: NotificationStatus.Success,
             })
         }
 
         if (alternativeQuote && (isAlternative || isExpired)) {
             removeNotification(`alternative-${alternativeQuote.id}`)
         }
 
         setAlternativeQuote(isAlternative ? selectedQuote : undefined)
 
     }, [selectedQuote])
 
     const onSuccess = useCallback(() => {
 
         if (!quote || !alternativeQuote) {
             return
         }
 
         setQuote((prev) => {
             if (prev?.recipientAddress) {
                 alternativeQuote.recipientAddress = prev.recipientAddress
             }
             return alternativeQuote
         })
         setIntervalMs(0)
         setCountdownMs(0)
 
         setNotification({
             id: `alternative-${alternativeQuote.id}`,
             type: NotificationType.Success,
             header: <div className="flex flex-row flex-1">
                 <DecimalAmount
                     amount={alternativeQuote.estDstAmount - quote.estDstAmount}
                     symbol={alternativeQuote.dstData.token.symbol}
                     token={alternativeQuote.dstData.token}
                     withSign={true}
                     className="font-bold text-success-500"
                 />
                 &nbsp;Selected
             </div>,
             body: `Successfully switched to quote returning more ${alternativeQuote.dstData.token.symbol}.`,
             status: NotificationStatus.Success,
         })
 
         setAlternativeQuote(undefined)
 
     }, [quote, setQuote, setNotification, alternativeQuote, setAlternativeQuote, setIntervalMs, setCountdownMs])
 
     const onCancel = useCallback(() => {
 
         setIntervalMs(0)
         setCountdownMs(0)
 
         if (alternativeQuote) {
             setNotification({
                 id: `alternative-${alternativeQuote.id}`,
                 type: NotificationType.Error,
                 header: `Error Switching Quote`,
                 body: `User cancelled switching to alternative quote.`,
                 status: NotificationStatus.Error,
             })
         }
 
         setAlternativeQuote(undefined)
 
     }, [setNotification, alternativeQuote, setAlternativeQuote, setIntervalMs, setCountdownMs])
 
     const setCountdownNotification = useCallback((ms: number) => {
 
         if (!quote || !alternativeQuote) {
             return
         }
 
         setNotification({
             id: `alternative-${alternativeQuote.id}`,
             type: NotificationType.Pending,
             header: <div className="flex flex-row flex-1">
                 <DecimalAmount
                     amount={alternativeQuote.estDstAmount - quote.estDstAmount}
                     symbol={alternativeQuote.dstData.token.symbol}
                     token={alternativeQuote.dstData.token}
                     withSign={true}
                     className="font-bold text-success-500"
                 />
                 &nbsp;Available
             </div>,
             body: `Automatically switching to alternative quote in ${formatDuration(ms)}.`,
             action: <div className="flex flex-row flex-1 gap-4 justify-center items-center">
                 <Button
                     className="flex flex-row flex-1 form-btn px-3 py-2"
                     replaceClass={true}
                     onClick={ms > 0 ? onCancel.bind(this) : undefined}
                     disabled={ms <= 0}
                 >
                     Cancel
                 </Button>
                 <Button
                     className="flex flex-row flex-1 gradient-btn px-3 py-2 w-full"
                     onClick={onSuccess.bind(this)}
                 >
                     Switch now
                 </Button>
             </div>,
             status: NotificationStatus.Pending,
         })
 
     }, [setNotification, quote, alternativeQuote, onSuccess, onCancel])
 
     useEffect(() => {
         if (quote && alternativeQuote) {
             setIntervalMs(1000)
             setCountdownMs(SwapQuoteConfig.AlternativeQuoteSwitchDelayMs)
             setCountdownNotification(SwapQuoteConfig.AlternativeQuoteSwitchDelayMs)
         }
     }, [alternativeQuote])
 
     useInterval(() => {
         const ms = countdownMs - intervalMs
         if (ms >= 0) {
             setCountdownMs(ms)
             setCountdownNotification(ms)
         }
         else {
             setIntervalMs(0)
             onSuccess()
         }
     }, intervalMs)
 
     return {
         alternativeQuote,
         countdownMs,
     }
 }
 
 export default useAlternativeSwapQuote