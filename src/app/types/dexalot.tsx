import { Address, Hex } from "viem"

export interface DexalotFirmQuoteOrder {
    nonceAndMeta: Hex,
    expiry: number,
    makerAsset: Address,
    takerAsset: Address,
    maker: Address,
    taker: Address,
    makerAmount: bigint,
    takerAmount: bigint,
}
