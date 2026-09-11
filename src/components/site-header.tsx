import Link from "next/link";
import { currentCustomer } from "@/server/auth";
import { CustomerNav } from "@/components/customer-nav";

export async function SiteHeader() { const user=await currentCustomer();return <><div className="site-utility" aria-label="VISAMGI message">Objects with a memory</div><header className="site-header shell"><Link className="brand" href="/" aria-label="VISAMGI home">VISAMGI</Link><CustomerNav authenticated={Boolean(user)}/></header></>; }
