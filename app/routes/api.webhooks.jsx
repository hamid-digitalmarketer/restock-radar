/**
 * Webhook Handler — Processes inventory level updates
 * Listens for inventory_levels/update and products/update webhooks
 */

import { json } from "@remix-run/node";
import { authenticateAdmin } from "../shopify.server";
import { getShopSettings, updateShopSettings } from "../models/shop.server";
import { createRestockEvent } from "../models/restock-event.server";

export async function webhook(request) {
  const { admin, session } = await authenticateAdmin(request);
  
  // Verify webhook signature (simplified for now)
  const signature = request.headers.get("x-shopify-verify");
  const body = await request.text();
  
  // In production, verify HMAC signature here
  // For MVP, we'll process all webhooks
  
  const topic = request.headers.get("x-shopify-topic");
  
  if (topic === "inventory_levels/update") {
    await handleInventoryUpdate(admin, session, request);
  } else if (topic === "products/update") {
    await handleProductUpdate(admin, session, request);
  }
  
  return new Response(null, { status: 200 });
}

async function handleInventoryUpdate(admin, session, request) {
  const payload = await request.json();
  const { available, inventory_item_id, location_id, quantity } = payload;
  
  // Check if product just went from 0 to positive (restock)
  const shopSettings = await getShopSettings(session.shop);
  const productId = payload.product_id;
  const variantId = inventory_item_id;
  
  // Check if there are active subscribers for this product/variant
  const shop = session.shop;
  const shopSettings = await getShopSettings(shop);
  const restockEvents = await createRestockEvent({
    shopDomain: session.shop,
    productId,
    variantId,
    inventoryQty: quantity,
  });
  
  // Send notifications to subscribers
  await sendRestockNotifications(admin, session, restockEvents, shopSettings);
}

async function handleProductUpdate(admin, session, request) {
  const payload = await request.json();
  const product = payload.product;
  const shop = session.shop;
  
  // Check if product status changed (active to draft or vice versa)
  // This could indicate inventory changes or other status updates
  const shopSettings = await getShopSettings(shop);
  // For now, we'll just ensure the shop settings are updated
  await updateShopSettings(shop, { ...shop, lastProductUpdate: new Date().toISOString() });
}

async function sendRestockNotifications(admin, session, restockEvents, shopSettings) {
  const shop = session.shop;
  const subscribers = await getAllActiveSubscribers(shop);
  
  for (const event of restockEvents) {
    for (const subscriber of subscribers) {
      await admin.rest.resource.Notification.create({
        session: admin.session,
        data: {
          subscriberId: subscriber.id,
          shopDomain: shop.shopDomain,
          productId: event.productId,
          variantId: event.variantId,
          type: "email",
          status: "sent",
          createdAt: new Date().toISOString(),
        },
      });
    }
  }
}

async function getAllActiveSubscribers(shop) {
  // Get all active subscribers for this shop
  const subscribers = await admin.rest.resource.Subscriber.all({
    session: admin.session,
    query: {
      shop_domain: shop.shopDomain,
      status: "active",
    },
  });
  return subscribers;
}