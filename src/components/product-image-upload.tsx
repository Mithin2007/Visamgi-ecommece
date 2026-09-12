"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import { uploadProductImage, type ImageUploadState } from "@/../app/admin/products/actions";

const initialState:ImageUploadState={error:"",success:""};

export function ProductImageUpload({productId}:{productId:string}){const [state,action,pending]=useActionState(uploadProductImage.bind(null,productId),initialState),[dragging,setDragging]=useState(false),inputRef=useRef<HTMLInputElement>(null);const placeFiles=(files:FileList)=>{if(inputRef.current)inputRef.current.files=files;};return <form className={`image-upload ${dragging?"image-upload--dragging":""}`} action={action} onDragOver={event=>{event.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();setDragging(false);placeFiles(event.dataTransfer.files);}}><label className="image-upload__drop"><input ref={inputRef} name="image" type="file" accept="image/jpeg,image/png,image/webp" required/><p className="eyebrow">Product image</p><strong>Drop an image here</strong><span>or click to choose a JPG, PNG, or WebP file · maximum 5 MB</span></label><label className="image-upload__alt">Image description (optional)<input name="alt" placeholder="Describe the product image"/></label><label className="image-upload__primary"><input name="makePrimary" type="checkbox" defaultChecked/> Use as the main collection image</label><button className="button" disabled={pending}>{pending?"Uploading…":"Save image"}</button>{state.error&&<p className="admin-form-error" role="alert">{state.error}</p>}{state.success&&<p className="admin-form-success" role="status">{state.success}</p>}</form>}
