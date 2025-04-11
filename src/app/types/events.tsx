import { Log } from "viem"
import { cellRollbackAbi, cellRollbackEvent } from "@/app/abis/cells/events/cellRollback"
import { cellRoutedAbi, cellRoutedEvent } from "@/app/abis/cells/events/cellRouted"
import { cellSwapFailedAbi, cellSwapFailedEvent } from "@/app/abis/cells/events/cellSwapFailed"
import { initiatedAbi, initiatedEvent } from "@/app/abis/cells/events/initiated"
import { tokensWithdrawnAbi, tokensWithdrawnEvent } from "@/app/abis/ictt/events/tokensWithdrawn"

export type CellRoutedLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof cellRoutedEvent, TStrict, typeof cellRoutedAbi, typeof cellRoutedEvent.name>
export type InitiatedLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof initiatedEvent, TStrict, typeof initiatedAbi, typeof initiatedEvent.name>
export type TokensWithdrawnLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof tokensWithdrawnEvent, TStrict, typeof tokensWithdrawnAbi, typeof tokensWithdrawnEvent.name>
export type CellRollbackLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof cellRollbackEvent, TStrict, typeof cellRollbackAbi, typeof cellRollbackEvent.name>
export type CellSwapFailedLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof cellSwapFailedEvent, TStrict, typeof cellSwapFailedAbi, typeof cellSwapFailedEvent.name>