import Link from "next/link";
import "@/styles/admin.css";
import { logoutAdmin } from "@/server/auth";
export default function AdminLayout({children}:{children:React.ReactNode}) { return <div className="admin-shell"><aside><Link className="brand" href="/admin/dashboard">VISAMGI <small>ADMIN</small></Link><nav><Link href="/admin/dashboard">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/inventory">Inventory</Link><span>Orders · Phase 4</span><span>Customers · Phase 3</span></nav><form action={async()=>{"use server";await logoutAdmin();}}><button type="submit">Sign out</button></form></aside><section className="admin-main">{children}</section></div>; }
