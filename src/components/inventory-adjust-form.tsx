"use client";

import { useActionState } from "react";
import { adjust, type StockAdjustmentState } from "@/../app/admin/inventory/actions";

const initialState:StockAdjustmentState={error:"",success:""};

export function InventoryAdjustForm({productId,productName}:{productId:string;productName:string}){const [state,action,pending]=useActionState(adjust,initialState);return <form action={action}><input type="hidden" name="productId" value={productId}/><input name="delta" type="number" step="1" required placeholder="+10 or -2" aria-label={`Stock adjustment for ${productName}`}/><input name="note" placeholder="Optional note" aria-label="Adjustment note"/><button disabled={pending}>{pending?"Saving…":"Save stock"}</button>{state.error&&<small className="admin-form-error" role="alert">{state.error}</small>}{state.success&&<small className="admin-form-success" role="status">{state.success}</small>}</form>}
