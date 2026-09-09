"use server";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/server/auth";
import { checkout } from "@/server/checkout";

export type CheckoutActionState={error:string};

const customerMessage=(error:unknown)=>{
  const message=error instanceof Error?error.message:"";
  const known=["Select one of your saved addresses.","Your bag is empty.","A product in your bag is unavailable.","A selected option is unavailable.","An item in your bag no longer has enough stock.","This address is outside the currently supported shipping region.","Shipping is being configured for VISAMGI.","A shipping charge has not been configured yet.","Cash on delivery is not currently available.","The selected payment method is not currently available.","Your bag changed. Please review it and try again."];
  return known.includes(message)?message:"We could not complete checkout. Please review your delivery details and bag, then try again.";
};

export async function placeOrder(_:CheckoutActionState,f:FormData):Promise<CheckoutActionState>{
  const user=await requireCustomer();
  if(f.get("paymentMethod")!=="COD")return{error:"Online payment is not available yet. Choose cash on delivery when it is offered."};
  try{const order=await checkout(user.id,String(f.get("addressId")),"COD",String(f.get("checkoutToken")));redirect(`/account/orders/${order.id}`);}catch(error){return{error:customerMessage(error)};}
}
