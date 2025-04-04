import { Log } from "viem"
import { cellRoutedAbi, cellRoutedEvent } from "@/app/abis/cells/events/cellRouted"
import { initiatedAbi, initiatedEvent } from "@/app/abis/cells/events/initiated"
import { tokensWithdrawnAbi, tokensWithdrawnEvent } from "@/app/abis/ictt/events/tokensWithdrawn"

export type CellRoutedLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof cellRoutedEvent, TStrict, typeof cellRoutedAbi, typeof cellRoutedEvent.name>
export type InitiatedLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof initiatedEvent, TStrict, typeof initiatedAbi, typeof initiatedEvent.name>
export type TokensWithdrawnLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof tokensWithdrawnEvent, TStrict, typeof tokensWithdrawnAbi, typeof tokensWithdrawnEvent.name>
