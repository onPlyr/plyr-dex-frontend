const SelectOptions = {
    src: "from",
    dst: "to",
}

export const dynamicParams = false
export const generateStaticParams = async () => {
    return Object.values(SelectOptions).map((value) => ({
        select: value,
    }))
}

const Layout = async ({
    children,
}: {
    children: React.ReactNode,
}) => {
    return children
}

export default Layout
