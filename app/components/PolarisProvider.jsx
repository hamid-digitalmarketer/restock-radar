/**
 * PolarisProvider — Wraps app with Shopify Polaris theme
 */

import { AppProvider } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

export function PolarisProvider({ children }) {
  return (
    <AppProvider
      apiVersion="2024-07"
      shopifyConfig={{ apiKey: process.env.SHOPIFY_API_KEY }}
      router={useAppBridge()}
    >
      {children}
    </AppProvider>
  );
}