"use client";
import { useFormStatus } from "react-dom";
export function CheckoutSubmit(){const {pending}=useFormStatus();return <button className="button" disabled={pending}>{pending?"Creating order…":"Create order"}</button>}
