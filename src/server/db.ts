import { Prisma, PrismaClient } from "@prisma/client";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaUrl?: string };
// The pooled Neon hostname intermittently fails from this Windows development host,
// while the matching direct Neon hostname is healthy. Keep the host name and TLS
// settings intact, changing only the connection route.
const databaseUrl = process.env.DATABASE_URL;
const directDatabaseUrl = databaseUrl?.replace("-pooler.", ".");
const activeDatabaseUrl = directDatabaseUrl ?? databaseUrl;
export const db = globalForPrisma.prisma && globalForPrisma.prismaUrl === activeDatabaseUrl
  ? globalForPrisma.prisma
  : new PrismaClient(
  directDatabaseUrl && directDatabaseUrl !== databaseUrl ? { datasourceUrl: directDatabaseUrl } : undefined,
);
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaUrl = activeDatabaseUrl;
}

const pause = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

function isTemporaryDatabaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1000", "P1001", "P1002", "P1008", "P1017", "P2024"].includes(error.code);
  }

  const message = error instanceof Error ? error.message : String(error);
  return /can't reach database|connection (?:closed|reset|refused)|econnreset|etimedout|socket hang up|temporarily unavailable/i.test(message);
}

/** Retries a short-lived database/network interruption before surfacing an error to a visitor. */
export async function withDatabaseRetry<T>(query: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await query();
    } catch (error) {
      lastError = error;
      if (!isTemporaryDatabaseError(error) || attempt === attempts - 1) throw error;
      await pause(200 * (attempt + 1));
    }
  }

  throw lastError;
}

const catalogueCacheDirectory = path.join(process.cwd(), ".next", "cache", "visamgi-catalogue");
const catalogueMemoryCache = globalThis as typeof globalThis & { visamgiCatalogueCache?: Map<string, unknown> };
const catalogueCache = catalogueMemoryCache.visamgiCatalogueCache ?? new Map<string, unknown>();
if (!catalogueMemoryCache.visamgiCatalogueCache) catalogueMemoryCache.visamgiCatalogueCache = catalogueCache;

const catalogueCachePath = (key: string) => path.join(catalogueCacheDirectory, `${Buffer.from(key).toString("base64url")}.json`);

/**
 * Keeps the last successful public catalogue response available during a temporary database outage.
 * The on-disk copy survives Next.js development reloads; failed writes never block the storefront.
 */
export async function withCatalogueFallback<T>(key: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const value = await withDatabaseRetry(query);
    catalogueCache.set(key, value);
    void mkdir(catalogueCacheDirectory, { recursive: true })
      .then(() => writeFile(catalogueCachePath(key), JSON.stringify(value), "utf8"))
      .catch(() => undefined);
    return value;
  } catch {
    const memoryValue = catalogueCache.get(key);
    if (memoryValue !== undefined) return memoryValue as T;

    try {
      const savedValue = JSON.parse(await readFile(catalogueCachePath(key), "utf8")) as T;
      catalogueCache.set(key, savedValue);
      return savedValue;
    } catch {
      return fallback;
    }
  }
}
