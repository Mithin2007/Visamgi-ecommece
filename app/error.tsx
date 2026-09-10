"use client";

import Link from "next/link";

export default function Error() {
  return <main className="route-state" role="alert"><p className="eyebrow">A gentle pause</p><h1>Something needs another moment.</h1><p>Your information remains safe. Please return to the collection and try again.</p><Link className="button" href="/shop">Return to collection</Link></main>;
}
