import { ReactNode, useEffect, useRef } from "react";

export default function ScrollIntoView(props: {children: ReactNode, isEnabled: boolean}){
    const scrollTo = useRef<HTMLDivElement>(null)
    const html = (<div ref={scrollTo}>{props.children}</div>)
    useEffect(() => {if (props.isEnabled && scrollTo.current) scrollTo.current.scrollIntoView()})
    return html
}