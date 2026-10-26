/**
 * Dashboard model — Gets stats for the main dashboard
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getDashboardStats(shopDomain) {
  // Get active subscriber count
  const subscriberCount = await prisma.subscriber.count({
    where: { shopDomain, status: "active" },
  });
  
  // Get total notifications sent count
  const notificationsSent = await prisma.notification.count({
    where: { shopDomain, status: "sent" },
  });
  
  // Get click count
  const clickedNotifications = await prisma.notification.count({
    where: { shopDomain, status: "clicked" },
  });
  
  // Calculate click rate
  const clickRate = subscriberCount > 0 
    ? Math.round((clickedNotifications / subscriberCount) * 100) 
    : 0;
  
  // Get attributed orders count (subscribers who purchased after clicking)
  const attributedOrders = await prisma.subscriber.count({
    where: { shopDomain, status: "purchased" },
  });
  
  return {
    activeSubscribers: subscriberCount,
    notificationsSent,
    clickRate,
    attributedOrders,
  };
}

export async function getRecentSubscribers(shopDomain, limit = 10) {
  return await prisma.subscriber.findMany({
    where: { shopDomain, status: "active" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      productTitle: true,
      status: true,
      createdAt: true,
    },
  });
}