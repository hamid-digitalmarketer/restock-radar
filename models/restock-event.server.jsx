/**
 * Restock Event model — Tracks when inventory restocks occur
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createRestockEvent(shopDomain, productId, variantId, inventoryQty) {
  return await prisma.restockEvent.create({
    data: {
      shopDomain: shopDomain,
      productId: productId,
      variantId: variantId,
      inventoryQty: inventoryQty,
    },
  });
}