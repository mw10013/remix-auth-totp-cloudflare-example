import { twx } from "~/lib/utils";

// https://ui.shadcn.com/docs/components/typography

export const H1 = twx.h1`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl`;
export const H2 = twx.h2`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0`;
export const H3 = twx.h3`scroll-m-20 text-2xl font-semibold tracking-tight`;
export const H4 = twx.h4`scroll-m-20 text-xl font-semibold tracking-tight`;
export const P = twx.p`leading-7 [&:not(:first-child)]:mt-6`;
export const Blockquote = twx.blockquote`mt-6 border-l-2 pl-6 italic`;
// table
// list
export const Code = twx.code`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold`;
export const Lead = twx.p`text-xl text-muted-foreground`;
export const Large = twx.div`text-lg font-semibold`;
export const Small = twx.div`text-sm font-medium leading-none`;
export const Muted = twx.div`text-sm text-muted-foreground`;
