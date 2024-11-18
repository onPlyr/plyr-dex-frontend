const gameInfo: any = {
    "zoono": {
        "name": "Zoono",
        "icon": "zoono.png",
    },
    "skyward": {
        "name": "Skyward",
        "icon": "skyward.png",
    }
}

export const getGameInfo = (gameId: string) => {
    return gameInfo[gameId] || {
        "name": gameId,
        "icon": "default.png",
    };
}
