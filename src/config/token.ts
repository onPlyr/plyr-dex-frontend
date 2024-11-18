const tokenInfo: any = {
    "plyr": {
        "name": "PLYR",
        "icon": "plyr_orange.svg",
    },
    "gamr": {
        "name": "GAMR",
        "icon": "gamr.svg",
    }
}

export const getTokenInfo = (token: string) => {
    return tokenInfo[token] || {
        "name": token,
        "icon": "default.png",
    };
}

export const tokenList = Object.keys(tokenInfo);
