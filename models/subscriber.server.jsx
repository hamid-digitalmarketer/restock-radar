/**
 * Subscriber model — CRUD operations for subscribers
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getSubscribers(shopDomain, { page = 1, limit = 25, search = "", status = "all" }) {
  const where = { shopDomain };
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { productTitle: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (status !== "all") {
    where.status = status;
  }
  
  return await prisma.subscriber.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      email: true,
      phone: true,
      productTitle: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getSubscriberCount(shopDomain, { search = "", status = "all" }) {
  const where = { shopDomain };
  
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { productTitle: { contains: search, mode: "insensitive" } },
    ];
  }
  
  if (status !== "all") {
    where.status = status;
  }
  
  return await prisma.subscriber.count({ where });
}

export async function createSubscriber(shopDomain, { email, phone, productId, variantId, productTitle, productHandle }) {
  return await prisma.subscriber.create({
    data: {
      shopDomain,
      email,
      phone,
      productId,
      variantId,
      productTitle,
      productHandle,
      status: "active",
    },
  });
}

export async function getSubscribersForVariant(shopDomain, variantId) {
  return await prisma.subscriber.findMany({
    where: { shopDomain, variantId, status: "active" },
    select: {
      id: true,
      email: true,
      phone: true,
    },
  });
}

export async function updateSubscriberStatus(subscriberId, status) {
  return await prisma.subscriber.update({
    where: { id: subscriberId },
    data: { status, notifiedAt: new Date() },
  });
}