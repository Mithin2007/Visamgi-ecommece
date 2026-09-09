import { InventoryReason, PrismaClient, StockStatus, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const PRIMARY_EMAIL = "dev.checkout.customer@visamgi.test";
const SECONDARY_EMAIL = "dev.secondary.customer@visamgi.test";
const CATEGORY_ID = "dev_seed_category";
const CATEGORY_SLUG = "dev-seed-category";
const VARIANT_PRODUCT_ID = "dev_seed_product_variants";
const STANDARD_PRODUCT_ID = "dev_seed_product_standard";
const SHIPPING_CONFIGURATION_ID = "dev_seed_shipping_configuration";

function requireDevelopmentGuards() {
  if (process.env.NODE_ENV === "production") throw new Error("Development commerce seed is disabled in production.");
  if (process.env.VISAMGI_DEV_SEED !== "true") throw new Error("Set VISAMGI_DEV_SEED=true to run the development commerce seed.");
  if (process.env.VISAMGI_DEV_SEED_CONFIRM !== "VISAMGI-DEVELOPMENT-ONLY") throw new Error("Set VISAMGI_DEV_SEED_CONFIRM to the required development-only confirmation value.");
  const password = process.env.VISAMGI_DEV_SEED_PASSWORD;
  if (!password || password.length < 14) throw new Error("Set a development seed password of at least 14 characters.");
  return password;
}

function assertSeedUser(user: { id: string; role: UserRole } | null, id: string, email: string) {
  if (user && (user.id !== id || user.role !== UserRole.CUSTOMER)) throw new Error(`Conflicting record found for ${email}.`);
}

function assertSeedCategory(category: { id: string; slug: string } | null) {
  if (category && (category.id !== CATEGORY_ID || category.slug !== CATEGORY_SLUG)) throw new Error("Conflicting development category record found.");
}

function assertSeedProduct(product: { id: string; sku: string; categoryId: string } | null, id: string, sku: string) {
  if (product && (product.id !== id || product.sku !== sku || product.categoryId !== CATEGORY_ID)) throw new Error(`Conflicting development product record found for ${sku}.`);
}

async function main() {
  const password = requireDevelopmentGuards();

  await db.$transaction(async (tx) => {
    const [primary, secondary, category, variantProduct, standardProduct, shippingConfigurations] = await Promise.all([
      tx.user.findUnique({ where: { email: PRIMARY_EMAIL } }),
      tx.user.findUnique({ where: { email: SECONDARY_EMAIL } }),
      tx.category.findUnique({ where: { slug: CATEGORY_SLUG } }),
      tx.product.findUnique({ where: { slug: "dev-seed-brass-lamp" } }),
      tx.product.findUnique({ where: { slug: "dev-seed-stone-bowl" } }),
      tx.shippingConfiguration.findMany(),
    ]);

    assertSeedUser(primary, "dev_seed_primary_customer", PRIMARY_EMAIL);
    assertSeedUser(secondary, "dev_seed_secondary_customer", SECONDARY_EMAIL);
    assertSeedCategory(category);
    assertSeedProduct(variantProduct, VARIANT_PRODUCT_ID, "dev-seed-brass-lamp-sku");
    assertSeedProduct(standardProduct, STANDARD_PRODUCT_ID, "dev-seed-stone-bowl-sku");

    if (shippingConfigurations.some((configuration) => configuration.id !== SHIPPING_CONFIGURATION_ID)) {
      throw new Error("A non-development shipping configuration already exists; seed aborted without changes.");
    }

    if (!primary || !secondary) {
      const passwordHash = await hash(password, 12);
      if (!primary) await tx.user.create({ data: { id: "dev_seed_primary_customer", email: PRIMARY_EMAIL, name: "Development Checkout Customer", passwordHash, role: UserRole.CUSTOMER, active: true } });
      if (!secondary) await tx.user.create({ data: { id: "dev_seed_secondary_customer", email: SECONDARY_EMAIL, name: "Development Secondary Customer", passwordHash, role: UserRole.CUSTOMER, active: true } });
    }

    if (!category) await tx.category.create({ data: { id: CATEGORY_ID, name: "Development Seed Collection", slug: CATEGORY_SLUG, description: "Development-only catalogue records for checkout verification.", sortOrder: 9999, published: true } });

    if (!variantProduct) await tx.product.create({ data: { id: VARIANT_PRODUCT_ID, name: "Development Brass Lamp", slug: "dev-seed-brass-lamp", description: "A development-only variant-backed product for safe checkout verification.", shortDescription: "Development-only commerce test product.", sku: "dev-seed-brass-lamp-sku", price: "2499.00", salePrice: "2399.00", stockQuantity: 10, lowStockThreshold: 2, stockStatus: StockStatus.IN_STOCK, categoryId: CATEGORY_ID, material: "Brass", color: "Antique brass", tags: ["development", "seed", "variant"], featured: false, published: true } });
    if (!standardProduct) await tx.product.create({ data: { id: STANDARD_PRODUCT_ID, name: "Development Stone Bowl", slug: "dev-seed-stone-bowl", description: "A development-only standard product for safe checkout verification.", shortDescription: "Development-only commerce test product.", sku: "dev-seed-stone-bowl-sku", price: "1299.00", stockQuantity: 6, lowStockThreshold: 2, stockStatus: StockStatus.IN_STOCK, categoryId: CATEGORY_ID, material: "Stone", color: "Natural", tags: ["development", "seed", "standard"], featured: false, published: true } });

    const variants = await tx.productVariant.findMany({ where: { sku: { in: ["dev-seed-brass-lamp-small", "dev-seed-brass-lamp-tall"] } } });
    for (const variant of variants) {
      const expected = variant.sku === "dev-seed-brass-lamp-small" ? "dev_seed_variant_small" : "dev_seed_variant_tall";
      if (variant.id !== expected || variant.productId !== VARIANT_PRODUCT_ID) throw new Error(`Conflicting development variant record found for ${variant.sku}.`);
    }
    if (!variants.some((variant) => variant.sku === "dev-seed-brass-lamp-small")) await tx.productVariant.create({ data: { id: "dev_seed_variant_small", productId: VARIANT_PRODUCT_ID, sku: "dev-seed-brass-lamp-small", name: "Small", attributes: { size: "Small", heightCm: 25 }, price: "2199.00", stockQuantity: 5 } });
    if (!variants.some((variant) => variant.sku === "dev-seed-brass-lamp-tall")) await tx.productVariant.create({ data: { id: "dev_seed_variant_tall", productId: VARIANT_PRODUCT_ID, sku: "dev-seed-brass-lamp-tall", name: "Tall", attributes: { size: "Tall", heightCm: 40 }, price: "2799.00", stockQuantity: 5 } });

    const initialTransactions = await tx.inventoryTransaction.findMany({ where: { id: { in: ["dev_seed_initial_variants", "dev_seed_initial_standard"] } } });
    for (const transaction of initialTransactions) {
      const expectedProductId = transaction.id === "dev_seed_initial_variants" ? VARIANT_PRODUCT_ID : STANDARD_PRODUCT_ID;
      if (transaction.productId !== expectedProductId || transaction.reason !== InventoryReason.INITIAL) throw new Error(`Conflicting development inventory record found for ${transaction.id}.`);
    }
    if (!initialTransactions.some((transaction) => transaction.id === "dev_seed_initial_variants")) await tx.inventoryTransaction.create({ data: { id: "dev_seed_initial_variants", productId: VARIANT_PRODUCT_ID, delta: 10, reason: InventoryReason.INITIAL, reference: "dev_seed_initial_variants", note: "Development seed initial stock" } });
    if (!initialTransactions.some((transaction) => transaction.id === "dev_seed_initial_standard")) await tx.inventoryTransaction.create({ data: { id: "dev_seed_initial_standard", productId: STANDARD_PRODUCT_ID, delta: 6, reason: InventoryReason.INITIAL, reference: "dev_seed_initial_standard", note: "Development seed initial stock" } });

    const addresses = await tx.address.findMany({ where: { id: { in: ["dev_seed_primary_address", "dev_seed_secondary_address"] } } });
    for (const address of addresses) {
      const expectedUserId = address.id === "dev_seed_primary_address" ? "dev_seed_primary_customer" : "dev_seed_secondary_customer";
      if (address.userId !== expectedUserId) throw new Error(`Conflicting development address record found for ${address.id}.`);
    }
    if (!addresses.some((address) => address.id === "dev_seed_primary_address")) await tx.address.create({ data: { id: "dev_seed_primary_address", userId: "dev_seed_primary_customer", fullName: "Development Checkout Customer", phone: "9000000001", line1: "101 Development Street", line2: "Commerce Test Suite", city: "Chennai", district: "Chennai", state: "Tamil Nadu", pincode: "600001", landmark: "Development-only address", type: "Home", isDefault: true } });
    if (!addresses.some((address) => address.id === "dev_seed_secondary_address")) await tx.address.create({ data: { id: "dev_seed_secondary_address", userId: "dev_seed_secondary_customer", fullName: "Development Secondary Customer", phone: "9000000002", line1: "202 Development Street", line2: "Commerce Test Suite", city: "Chennai", district: "Chennai", state: "Tamil Nadu", pincode: "600002", landmark: "Development-only address", type: "Home", isDefault: true } });

    const shippingConfiguration = shippingConfigurations[0];
    if (shippingConfiguration && (shippingConfiguration.id !== SHIPPING_CONFIGURATION_ID || shippingConfiguration.shippingCharge === null || shippingConfiguration.freeShippingThreshold === null || !shippingConfiguration.codEnabled || !shippingConfiguration.supportedStates.includes("Tamil Nadu"))) throw new Error("Conflicting development shipping configuration found.");
    if (!shippingConfiguration) await tx.shippingConfiguration.create({ data: { id: SHIPPING_CONFIGURATION_ID, supportedStates: ["Tamil Nadu"], shippingCharge: "99.00", freeShippingThreshold: "3000.00", deliveryEstimate: "3–5 development days", codEnabled: true } });
  });

  console.log("Development commerce seed prerequisites are ready.");
}

main().finally(() => db.$disconnect());
