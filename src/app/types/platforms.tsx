// todo: tbc
// id is slug format, unique identifier and used for img paths
export interface Platform {
    id: Lowercase<string>,
    name: string,
    img?: PlatformImageData,
}

export interface PlatformImageData {
    square?: string,
    squareDark?: string,
    squareLight?: string,
    brand?: string,
    brandDark?: string,
    brandLight?: string,
}
