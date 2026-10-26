/**
 * Restock Notify Button — Shopify App Extension Block
 * Appears on product pages when product is out of stock
 */

import { useEffect } from "react";
import {
  useProductAvailability,
  useProductAvailabilityObserver,
  AddToCart,
  NotImplemented,
  PolarisIcon,
} from "@shopify/polaris";
import { useLocation } from "@remix-run/react";
import { useParams, useLink } from "@remix-run/router";
import { useForm } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticateAdmin } from "../shopify.server";
import { useState } from "react";
import { addDocumentResponseHeaders } from "../shopify.server";

export default function NotifyButton() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = await authenticateAdmin(
    new Request(`${location.pathname}${location.search}`, { method: "GET" })
  );

  const { available, variant } = useProductAvailability(productId);
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If product is in stock, show Add to Cart instead
  if (available && variant) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px" }}>
        <AddToCart style={{ margin: "0 8px" }} />
        <NotImplemented style={{ margin: "0 8px" }} />
      </div>
    );
  }

  // Product is out of stock - show Notify Me button
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px" }}>
      <button
        onClick={() => setShowForm(true)}
        style={{
          backgroundColor: "#242424",
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        <PolarisIcon iconName="bell" size="xs" style={{ marginRight: "8px" }} />
        Notify Me
      </button>

      {/* Modal form */}
      {showForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            padding: "32px",
            borderRadius: "8px",
            width: "320px",
            maxWidth: "90vw",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "18px" }}>Notify Me When Available</h3>

            {/* Email form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email || submitting) return;
                setSubmitting(true);
                notifySubscriber(admin, productId, variant.id, email)
                  .then(() => {
                    setShowSuccess(true);
                    setShowForm(false);
                    setSubmitting(false);
                    setEmail("");
                  })
                  .catch((err) => {
                    console.error("Notification failed:", err);
                    setSubmitting(false);
                  });
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "6px 12px" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{
                  backgroundColor: "#242424",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}>
                  {submitting ? "Sending..." : "Sign Up"}
                </button>
              </div>
            </form>

            {/* Success message */}
            {showSuccess && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontSize: "14px" }}>Thanks!</p>
                <p style={{ margin: "0", fontSize: "14px" }}>
                  We'll notify you as soon as {{productId}} is back in stock.
                </p>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#242424",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Notify subscriber via API
 */
async function notifySubscriber(admin, productId, variantId, email) {
  const response = await admin.rest.resource.Subscriber.create({
    session: admin.session,
    data: {
      email,
      productId,
      variantId,
      status: "active",
    },
  });
  return response.data;
}