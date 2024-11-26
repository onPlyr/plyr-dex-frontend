export async function loadTokenList() {
    // Revalidate every 5 minutes //
    const resTokenList = await fetch('https://tokenlist.onplyr.com/plyrswap.tokenlist.json', { next: { revalidate: 300 } })
    const data = await resTokenList.json()

    console.log('data', data)
    let tokenList: any[] = [];

    // Add PLYR //
    tokenList.push({
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'PLYR',
        decimals: 18,
        logoURI: 'https://tokenlist.onplyr.com/token_icons/16180/PLYR.png'
    })

    data.tokens.filter((token: any) => token.chainId === (process.env.NEXT_PUBLIC_NETWORK_TYPE === 'mainnet' ? 16180 : 62831)).forEach((token: any) => {
        if (token.symbol === 'WPLYR') {
            return;
        }
        tokenList.push({
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            logoURI: token.logoURI
        })
    })
    return tokenList;
}