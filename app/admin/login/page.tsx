"use client";
import { useActionState } from "react";
import { login } from "./actions";
export default function AdminLogin() { const [state,action,pending]=useActionState(login,{error:""}); return <main className="admin-login"><form action={action}><p className="eyebrow">VISAMGI private console</p><h1>Welcome back.</h1><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{state.error && <p role="alert">{state.error}</p>}<button className="button" disabled={pending}>{pending?"Signing in…":"Sign in"}</button></form></main>; }
