"use client";
import Link from "next/link";
export default function AdminError(){return <section className="admin-empty" role="alert"><p className="eyebrow">Action unavailable</p><h1>We couldn’t complete that request.</h1><p>Please confirm the information and try again. No changes were made if the action failed.</p><Link href="/admin/dashboard">Return to overview</Link></section>}
