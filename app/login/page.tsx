"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/actions";
export default function Login(){const [state,action,pending]=useActionState(login,{error:""});return <main className="auth-page"><section className="auth-card"><Link className="brand" href="/">VISAMGI</Link><p className="eyebrow">Your account</p><h1>Welcome back.</h1><p className="auth-card__intro">Sign in to view your saved pieces, addresses and orders.</p><form action={action}><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" required/></label>{state.error&&<p className="form-error" role="alert">{state.error}</p>}<button className="button" disabled={pending}>{pending?"Signing in…":"Sign in"}</button></form><p className="auth-card__switch">New to VISAMGI? <Link href="/register">Create an account</Link></p></section></main>}
