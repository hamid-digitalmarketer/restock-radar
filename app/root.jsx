/**
 * Restock Radar — Shopify Embedded App
 * Root component
 */

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { PolarisProvider } from "./components/PolarisProvider";

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="shopify-api-key" content={process.env.SHOPIFY_API_KEY} />
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          data-api-key={process.env.SHOPIFY_API_KEY}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <PolarisProvider>
      <Outlet />
    </PolarisProvider>
  );
}
