export const timeAgo = (date: Date) => {

    const formatter = new Intl.RelativeTimeFormat("en")
    const secondsElapsed = (date.getTime() - Date.now()) / 1000
    const ranges = {
        years: 3600 * 24 * 365,
        months: 3600 * 24 * 30,
        weeks: 3600 * 24 * 7,
        days: 3600 * 24,
        hours: 3600,
        minutes: 60,
        seconds: 1
    } as const

    if (Math.round(secondsElapsed) === 0) {
        return "just now"
    }

    for (const key in ranges) {
        const keyStr = key as keyof typeof ranges
        if (ranges[keyStr] < Math.abs(secondsElapsed)) {
            const delta = secondsElapsed / ranges[keyStr]
            return formatter.format(Math.round(delta), keyStr)
        }
    }
}

export const timestampAgo = (timestamp: number) => {
    return timeAgo(new Date(timestamp))
}

export const padNum = (num: number, padStr?: string) => {
    return num < 10 ? num.toString().padStart(2, padStr ?? "0") : num.toString()
}

export enum DatePrecision {
    Date = "date",
    Minutes = "minutes",
    Seconds = "seconds",
    Milliseconds = "ms",
}

export const dateToISO = (date: Date, precision?: DatePrecision, utc?: boolean, dateDelim?: string, timeDelim?: string) => {

    const d = dateDelim ?? "-"
    const t = timeDelim ?? ":"
    const p = precision ?? DatePrecision.Seconds

    const year = utc ? date.getUTCFullYear() : date.getFullYear()
    const month = padNum((utc ? date.getUTCMonth() : date.getMonth()) + 1)
    const day = padNum(utc ? date.getUTCDate() : date.getDate())

    const iso = [year, month, day].join(d)
    if (p === DatePrecision.Date) {
        return iso
    }

    const hour = padNum(utc ? date.getUTCHours() : date.getHours())
    const minutes = padNum(utc ? date.getUTCMinutes() : date.getMinutes())
    const timeValues = [hour, minutes]

    if (p === DatePrecision.Seconds || p == DatePrecision.Milliseconds) {
        timeValues.push(padNum(utc ? date.getUTCSeconds() : date.getSeconds()))
        if (p === DatePrecision.Milliseconds) {
            timeValues.push(padNum(utc ? date.getUTCMilliseconds() : date.getMilliseconds()))
        }
    }

    return `${iso} ${timeValues.join(t)}`
}

export const timestampToISO = (timestamp: number, precision?: DatePrecision, utc?: boolean, dateDelim?: string, timeDelim?: string) => {
    return dateToISO(new Date(timestamp), precision, utc, dateDelim, timeDelim)
}

export const formatDuration = (duration: number) => {
    if (duration <= 0) {
        return "< 1s"
    }
    const minutes = Math.floor(duration / 60000)
    const seconds = parseFloat(((duration % 60000) / 1000).toFixed(1))
    return minutes === 0 ? `${seconds}s` : seconds === 60 ? `${minutes + 1}m` : seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
}
