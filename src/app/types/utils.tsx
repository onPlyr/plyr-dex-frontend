export type WithRequired<T, Key extends keyof T> = T & {
    [Property in Key]-?: T[Property]
}
