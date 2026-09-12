"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Option={value:string;label:string};
type Filter={name:"category"|"availability"|"sort";label:string;options:Option[]};

function FilterMenu({filter,value,onChange}:{filter:Filter;value:string;onChange:(value:string)=>void}){
  const [open,setOpen]=useState(false),ref=useRef<HTMLDivElement>(null);
  const selected=filter.options.find(option=>option.value===value)??filter.options[0];
  useEffect(()=>{const close=(event:MouseEvent)=>{if(ref.current&&!ref.current.contains(event.target as Node))setOpen(false);};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close);},[]);
  return <div className="filter-menu" ref={ref}><span>{filter.label}</span><button type="button" className="filter-menu__trigger" aria-expanded={open} onClick={()=>setOpen(!open)}>{selected.label}<i/></button>{open&&<div className="filter-menu__options" role="listbox" aria-label={filter.label}>{filter.options.map(option=><button type="button" role="option" aria-selected={option.value===value} className={option.value===value?"selected":""} key={option.value} onClick={()=>{onChange(option.value);setOpen(false);}}>{option.label}{option.value===value&&<b>✓</b>}</button>)}</div>}</div>;
}

export function CollectionFilters({initialQuery,initialCategory,initialAvailability,initialSort,categories}:{initialQuery:string;initialCategory:string;initialAvailability:string;initialSort:string;categories:Option[]}){
  const router=useRouter(),[query,setQuery]=useState(initialQuery),[category,setCategory]=useState(initialCategory),[availability,setAvailability]=useState(initialAvailability),[sort,setSort]=useState(initialSort);
  const filters:Filter[]=[{name:"category",label:"Collection",options:[{value:"",label:"All collections"},...categories]},{name:"availability",label:"Availability",options:[{value:"",label:"Show all"},{value:"available",label:"Available now"}]},{name:"sort",label:"Sort by",options:[{value:"newest",label:"Newest first"},{value:"price-low",label:"Price: low to high"},{value:"price-high",label:"Price: high to low"}]}];
  const apply=(event:React.FormEvent)=>{event.preventDefault();const params=new URLSearchParams();if(query.trim())params.set("q",query.trim());if(category)params.set("category",category);if(availability)params.set("availability",availability);if(sort!=="newest")params.set("sort",sort);router.push(`/shop${params.size?`?${params}`:""}`);};
  return <form className="shop-tools" onSubmit={apply}><label className="shop-tools__search">Search the collection<input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search by product or material"/></label><FilterMenu filter={filters[0]} value={category} onChange={setCategory}/><FilterMenu filter={filters[1]} value={availability} onChange={setAvailability}/><FilterMenu filter={filters[2]} value={sort} onChange={setSort}/><button className="button">Apply</button></form>;
}
