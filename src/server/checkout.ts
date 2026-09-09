import { PaymentMethod, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { db } from "@/server/db";

const zero=new Prisma.Decimal(0);

type CheckoutProduct={id:string;name:string;sku:string;price:Prisma.Decimal;salePrice:Prisma.Decimal|null;published:boolean;archivedAt:Date|null;stockQuantity:number;variants:{id:string;sku:string;name:string;attributes:Prisma.JsonValue;price:Prisma.Decimal|null;stockQuantity:number}[]};
type CheckoutItem={id:string;productId:string;variantId:string|null;quantity:number;product:CheckoutProduct};
type CheckoutAddress={id:string;fullName:string;phone:string;line1:string;line2:string|null;city:string;district:string|null;state:string;pincode:string;landmark:string|null};
type ShippingConfiguration={supportedStates:string[]|null;shippingCharge:Prisma.Decimal|null;freeShippingThreshold:Prisma.Decimal|null;deliveryEstimate:string|null;codEnabled:boolean};

export type CheckoutQuote={
  lines:{id:string;productId:string;productName:string;sku:string;variantId:string|null;variantName:string|null;variantAttributes:Prisma.JsonValue|undefined;price:Prisma.Decimal;quantity:number;subtotal:Prisma.Decimal}[];
  address:CheckoutAddress;
  subtotal:Prisma.Decimal;
  shipping:Prisma.Decimal;
  discount:Prisma.Decimal;
  tax:Prisma.Decimal;
  total:Prisma.Decimal;
  deliveryEstimate:string|null;
  allowedPaymentMethods:PaymentMethod[];
};

const priceOf=(product:Pick<CheckoutProduct,"price"|"salePrice"|"variants">,variantId:string|null)=>product.variants.find(v=>v.id===variantId)?.price??product.salePrice??product.price;

export function calculateShipping(subtotal:Prisma.Decimal,addressState:string,configuration:ShippingConfiguration|null){
  if(!configuration)return{available:false as const,reason:"Shipping is being configured for VISAMGI.",shipping:zero,codEnabled:false,deliveryEstimate:null};
  if(configuration.supportedStates?.length&&!configuration.supportedStates.some(state=>state.toLowerCase()===addressState.toLowerCase()))return{available:false as const,reason:"This address is outside the currently supported shipping region.",shipping:zero,codEnabled:configuration.codEnabled,deliveryEstimate:configuration.deliveryEstimate};
  if(configuration.freeShippingThreshold&&subtotal.greaterThanOrEqualTo(configuration.freeShippingThreshold))return{available:true as const,shipping:zero,codEnabled:configuration.codEnabled,deliveryEstimate:configuration.deliveryEstimate};
  if(configuration.shippingCharge===null)return{available:false as const,reason:"A shipping charge has not been configured yet.",shipping:zero,codEnabled:configuration.codEnabled,deliveryEstimate:configuration.deliveryEstimate};
  return{available:true as const,shipping:configuration.shippingCharge,codEnabled:configuration.codEnabled,deliveryEstimate:configuration.deliveryEstimate};
}

function buildCheckoutQuote(items:CheckoutItem[],address:CheckoutAddress,configuration:ShippingConfiguration|null):CheckoutQuote{
  if(!items.length)throw new Error("Your bag is empty.");
  let subtotal=zero;
  const lines=items.map(item=>{
    const product=item.product;
    if(!product.published||product.archivedAt)throw new Error("A product in your bag is unavailable.");
    const variant=item.variantId?product.variants.find(value=>value.id===item.variantId):undefined;
    if(item.variantId&&!variant)throw new Error("A selected option is unavailable.");
    if((variant?.stockQuantity??product.stockQuantity)<item.quantity)throw new Error("An item in your bag no longer has enough stock.");
    const price=priceOf(product,item.variantId);
    const lineSubtotal=price.mul(item.quantity);
    subtotal=subtotal.add(lineSubtotal);
    return {id:item.id,productId:item.productId,productName:product.name,sku:variant?.sku??product.sku,variantId:item.variantId,variantName:variant?.name??null,variantAttributes:variant?.attributes,price,quantity:item.quantity,subtotal:lineSubtotal};
  });
  const shippingState=calculateShipping(subtotal,address.state,configuration);
  if(!shippingState.available)throw new Error(shippingState.reason);
  const shipping=shippingState.shipping;
  return {lines,address,subtotal,shipping,discount:zero,tax:zero,total:subtotal.add(shipping),deliveryEstimate:shippingState.deliveryEstimate,allowedPaymentMethods:shippingState.codEnabled?["COD"]:[]};
}

export async function getCheckoutQuote(userId:string,addressId:string){
  const [address,cart,configuration]=await Promise.all([
    db.address.findFirst({where:{id:addressId,userId}}),
    db.cart.findFirst({where:{userId,status:"ACTIVE"},include:{items:{include:{product:{include:{variants:true}}}}}}),
    db.shippingConfiguration.findFirst(),
  ]);
  if(!address)throw new Error("Select one of your saved delivery addresses.");
  return buildCheckoutQuote(cart?.items??[],address,configuration);
}
export async function checkout(userId:string,addressId:string,paymentMethod:PaymentMethod,token:string){
  if(!token||token.length<16)throw new Error("Invalid checkout request.");
  return db.$transaction(async tx=>{
    const existing=await tx.order.findFirst({where:{userId,checkoutToken:token},include:{items:true}});if(existing)return existing;
    const address=await tx.address.findFirst({where:{id:addressId,userId}});if(!address)throw new Error("Select one of your saved addresses.");
    const cart=await tx.cart.findFirst({where:{userId,status:"ACTIVE"},include:{items:{include:{product:{include:{variants:true}}}}}});
    if(!cart)throw new Error("Your bag is empty.");
    const quote=buildCheckoutQuote(cart?.items??[],address,await tx.shippingConfiguration.findFirst());
    if(!quote.allowedPaymentMethods.includes(paymentMethod))throw new Error("The selected payment method is not currently available.");
    const order=await tx.order.create({data:{orderNumber:`VSG-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0,5).toUpperCase()}`,checkoutToken:token,userId,addressSnapshot:{fullName:address.fullName,phone:address.phone,line1:address.line1,line2:address.line2,city:address.city,district:address.district,state:address.state,pincode:address.pincode,landmark:address.landmark},subtotal:quote.subtotal,shipping:quote.shipping,discount:quote.discount,tax:quote.tax,total:quote.total,paymentMethod,paymentStatus:"PENDING",orderStatus:"PENDING",items:{create:quote.lines.map(line=>({productId:line.productId,productNameSnapshot:line.productName,skuSnapshot:line.sku,variantNameSnapshot:line.variantName,variantAttributesSnapshot:line.variantAttributes??undefined,priceSnapshot:line.price,quantity:line.quantity,subtotal:line.subtotal}))},payment:{create:{provider:paymentMethod==="COD"?"COD":"PENDING_RAZORPAY",amount:quote.total,status:"PENDING"}}}});
    for(const line of quote.lines){const item=cart?.items.find(value=>value.id===line.id);if(!item)throw new Error("Your bag changed. Please review it and try again.");const variant=line.variantId?item.product.variants.find(value=>value.id===line.variantId):undefined;if(variant){const result=await tx.productVariant.updateMany({where:{id:variant.id,stockQuantity:{gte:line.quantity}},data:{stockQuantity:{decrement:line.quantity}}});if(result.count!==1)throw new Error("An item is no longer available.");}else{const result=await tx.product.updateMany({where:{id:item.productId,stockQuantity:{gte:line.quantity}},data:{stockQuantity:{decrement:line.quantity}}});if(result.count!==1)throw new Error("An item is no longer available.");const current=await tx.product.findUniqueOrThrow({where:{id:item.productId}});await tx.product.update({where:{id:item.productId},data:{stockStatus:current.stockQuantity===0?"OUT_OF_STOCK":current.stockQuantity<=current.lowStockThreshold?"LOW_STOCK":"IN_STOCK"}});}await tx.inventoryTransaction.create({data:{productId:item.productId,delta:-line.quantity,reason:"RESERVATION",reference:order.orderNumber,actorId:userId}});await tx.inventoryReservation.create({data:{orderId:order.id,productId:item.productId,variantId:item.variantId,quantity:line.quantity}});}
    await tx.cart.update({where:{id:cart.id},data:{status:"CONVERTED",convertedAt:new Date()}});await tx.auditLog.create({data:{actorId:userId,action:"ORDER_CREATED",entityType:"Order",entityId:order.id,metadata:{orderNumber:order.orderNumber}}});return order;
  });
}
