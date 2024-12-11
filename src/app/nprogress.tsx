"use client"

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function NProgress() {
    return (
        <ProgressBar
            height="2px"
            color="#daff00"
            options={{ showSpinner: false }}
            shallowRouting
        />
    )
}