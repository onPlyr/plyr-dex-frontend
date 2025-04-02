import { Log } from "viem"
import { cellRoutedAbi, cellRoutedEvent } from "@/app/abis/cells/events/cellRouted"

export type CellRoutedLog<TStrict extends boolean = true> = Log<bigint, number, boolean, typeof cellRoutedEvent, TStrict, typeof cellRoutedAbi, typeof cellRoutedEvent.name>
