import Link from "next/link";

export default function NotFound() {
  return <main className="route-state"><p className="eyebrow">Not found</p><h1>This page has moved beyond the threshold.</h1><p>It may no longer be available, or the link may be incomplete.</p><Link className="button" href="/shop">Return to collection</Link></main>;
}
