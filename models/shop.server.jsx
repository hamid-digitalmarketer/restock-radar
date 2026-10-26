/**
 * Shop settings model — Stores merchant preferences
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getShopSettings(shopDomain) {
  return await prisma.shop.findUnique({
    where: { shopDomain },
  });
}

export async function updateShopSettings(shopDomain, data) {
  return await prisma.shop.update({
    where: { shopDomain },
    data,
  });
}