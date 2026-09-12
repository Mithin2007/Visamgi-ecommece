"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const isInternal=(anchor:HTMLAnchorElement)=>{const url=new URL(anchor.href,window.location.href);return url.origin===window.location.origin&&!anchor.target&&!anchor.hasAttribute("download")&&url.pathname+url.search!==window.location.pathname+window.location.search;};

export function NavigationExperience(){
  const [navigating,setNavigating]=useState(false),pathname=usePathname(),search=useSearchParams(),router=useRouter();
  useEffect(()=>setNavigating(false),[pathname,search]);
  useEffect(()=>{
    const prefetch=(event:PointerEvent)=>{const anchor=(event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");if(anchor&&isInternal(anchor))router.prefetch(anchor.href);};
    const begin=(event:MouseEvent)=>{if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const anchor=(event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");if(anchor&&isInternal(anchor))setNavigating(true);};
    document.addEventListener("pointerover",prefetch,{capture:true,passive:true});document.addEventListener("click",begin,true);
    return()=>{document.removeEventListener("pointerover",prefetch,true);document.removeEventListener("click",begin,true);};
  },[router]);
  return <div className={`navigation-transition${navigating?" navigation-transition--active":""}`} aria-hidden={!navigating}><div><div className="navigation-transition__mark"><i/><i/><i/></div><p className="brand">VISAMGI</p><small>Opening your selection</small></div></div>;
}
