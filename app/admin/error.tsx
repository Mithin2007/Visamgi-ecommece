"use client";
import Link from "next/link";
export default function AdminError({error,reset}:{error:Error & {digest?:string};reset:()=>void}){return <section className="admin-empty" role="alert"><p className="eyebrow">Action needs attention</p><h1>We couldn’t complete that request.</h1><p>{error.message||"Please confirm the information and try again. No changes were made if the action failed."}</p><div><button className="button" onClick={reset}>Try again</button> <Link href="/admin/dashboard">Return to overview</Link></div></section>}
