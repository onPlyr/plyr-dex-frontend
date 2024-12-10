import Image from "next/image"
import Link from "next/link"

const NavLogo = () => {
    return (
        <Link
            href="/"
            className="flex flex-row shrink gap-6 justify-start items-center"
        >
            <div className="block lg:hidden relative w-16 min-w-16 max-w-16 h-16 min-h-16 max-h-16 aspect-square">
                <Image
                    src="/logos/icon-white-square.png"
                    alt="Tesseract"
                    style={{
                        objectFit: "contain",
                        objectPosition: "center",
                    }}
                    fill={true}
                    priority={true}
                />
            </div>
            <div className="hidden lg:block relative w-80 min-w-80 max-w-80 h-16 min-h-16 max-h-16">
                <Image
                    src="/logos/logo-white.png"
                    alt="Tesseract"
                    style={{
                        objectFit: "contain",
                        objectPosition: "left",
                    }}
                    fill={true}
                    priority={true}
                />
            </div>
        </Link>
    )
}

export default NavLogo
