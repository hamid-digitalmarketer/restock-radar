/**
 * Shopify server configuration
 * Handles OAuth, session management, and API initialization
 */

import { shopifyApp, createFileSessionStorage } from "@shopify/shopify-app-remix";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";

const dbSessionStorage = createFileSessionStorage({
  sessionCookieName: "restock_radar_session",
  cookieOptions: {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  },
});

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  apiVersion: "2024-07",
  scopes: ["read_products", "read_inventory", "read_customers"],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: dbSessionStorage,
  restResources,
  webhooks: {
    path: "/webhooks",
    topics: {
      INVENTORY_LEVELS_UPDATE: {
        deliveryMethod: "http",
        includeFields: ["available", "inventory_item_id", "location_id"],
      },
      PRODUCTS_UPDATE: {
        deliveryMethod: "http",
      },
      APP_UNINSTALLED: {
        deliveryMethod: "http",
      },
      SHOP_UPDATE: {
        deliveryMethod: "http",
      },
    },
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      // Register webhooks after OAuth
      await registerWebhooks(session.shop, admin);
    },
  },
});

async function registerWebhooks(shop, admin) {
  try {
    const response = await admin.rest.resources.Webhook.all({ session: session });
    // Webhooks auto-registered via config
    console.log(`Webhooks registered for shop: ${shop}`);
  } catch (error) {
    console.error("Webhook registration error:", error);
  }
}

export async function authenticateAdmin(request) {
  return shopify.authenticate.admin(request);
}

export async function addDocumentResponseHeaders(response) {
  return shopify.addDocumentResponseHeaders(response);
}

export function initializeShopify() {
  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
    console.warn(
      "SHOPIFY_API_KEY and SHOPIFY_API_SECRET must be set. The app will not function without them."
    );
  }
}
