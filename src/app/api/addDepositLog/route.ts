import { NextResponse } from 'next/server'
//import crypto from 'crypto';
export const runtime = 'edge'

async function signHmac(timestamp: string, data: any) {
    const key: string = process.env.PLYR_API_HMAC_SECRET || '';
    const body = timestamp + JSON.stringify(data);

    console.log('Payload to sign HMAC', body);

    var hmac = '';

    // encoder to convert string to Uint8Array
    var enc = new TextEncoder();

    const subtlekey = await crypto.subtle.importKey(
        "raw", // raw format of the key - should be Uint8Array
        enc.encode(key),
        { // algorithm details
            name: "HMAC",
            hash: { name: "SHA-256" }
        },
        false, // export = false
        ["sign", "verify"] // what this key can do
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        subtlekey,
        enc.encode(body)
    )

    // Digest //
    var b = new Uint8Array(signature);
    var str = Array.prototype.map.call(b, x => x.toString(16).padStart(2, '0')).join("")

    hmac = str;

    //console.log('hmac', hmac)
    return hmac;
}



export async function POST(request: Request) {
    if ((process.env?.API_REQUIRED_ORIGIN || '') !== '') {
        const origin = request.headers.get('host') || 'wrong origin';
        if (!process.env.API_REQUIRED_ORIGIN?.includes(origin)) {
            return NextResponse.json({ success: false }, { status: 400 })
        }
    }
    /*
        {
            plyrId
            gameId
            token
            amount
            hash
        }
    */
    try {
        const res = await request.json();
        const timestamp = Date.now().toString();

        const hmac = await signHmac(timestamp, res);

        if (!res.plyrId || !res.token || !res.amount || !res.hash) {
            return NextResponse.json({ success: false }, { status: 400 })
        }


        // console.log('Param to find',paramToFind)
        const apiEndpoint = process.env.PLYR_API_ENDPOINT + '/user/addDepositLog/';
        const apiKey = process.env.PLYR_API_HMAC_KEY || '';

        // console.log('apiEndpoint', apiEndpoint)
        // console.log('hmac', hmac)
        // console.log('timestamp', timestamp)
        // console.log('apiKey', apiKey)

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apiKey': apiKey,
                'timestamp': timestamp,
                'signature': hmac
            },
            body: JSON.stringify(res)
        });
        // console.log(response)
        const retJson = await response.json();
        console.log(retJson)

        return NextResponse.json(retJson, { status: 200 })
    }
    catch (error: any) {
        {
            console.log('Error', error)
            return NextResponse.json({ success: false }, { status: 400 })
        }

    }
}