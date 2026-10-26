/**
 * Restock Radar — Shopify Embedded App
 * Remix entry point
 */

import { PassThrough } from "node:stream";
import { createReadableStreamFromNode } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { initializeShopify } from "./shopify.server";

initializeShopify();

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  const callbackName = isbot(request.headers.get("user-agent") || "")
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToReadableStream(
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={60000}
      />,
      {
        [callbackName]: () => {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromNode(body);

          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );
  });
}
