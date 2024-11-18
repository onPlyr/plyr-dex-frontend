"use client";

export const SourceCodeProOverrided = (props: any) => {
    
    return (
        <style jsx global>
            {
                `
                .${props.fontClassName.toString()}
                {
                letter-spacing: -1px;
            }
                `
            }
        </style>
    )
}