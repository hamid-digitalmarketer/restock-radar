# MVP Specification — Restock Radar
## Back-in-Stock & Preorder Recovery Shopify App

**Version:** 1.0  
**Date:** October 26, 2026  

---

## 1. Target Merchant & Problem

**Target merchant:** Shopify merchants selling physical products who experience stockouts — particularly those with seasonal, limited-edition, or high-demand items where inventory temporarily runs out.

**Problem:** When products go out of stock, merchants lose sales. Customers leave without purchasing and rarely return on their own. Merchants need a way to capture that demand, notify customers when inventory returns, and convert those notifications into sales.

**Result:** Merchants recover lost sales from stockouts with minimal setup, reliable notifications, and clear visibility into what's working.

---

## 2. Core User Journey

### Customer Journey (Storefront)
1. Customer visits a product page that is out of stock
2. A "Notify Me When Available" button/form appears on the product page
3. Customer enters email address (and optionally phone number for SMS)
4. Customer receives confirmation: "We'll notify you when this item is back in stock"
5. When inventory is restocked, customer receives an email/SMS with a link to purchase
6. Customer clicks through and completes purchase

### Merchant Journey (Admin)
1. Merchant installs Restock Radar from Shopify App Store
2. Onboarding wizard guides setup in under 5 minutes
3. Merchant selects which products/variants to enable notifications for (default: all)
4. Merchant customizes notification email template (brand colors, logo, message)
5. Merchant views dashboard: total subscribers, notifications sent, click-through rate, purchases attributed
6. Merchant can export subscriber data and manage notification frequency

---

## 3. Minimum Required Features (MVP)

### 3.1 Storefront
- [x] "Notify Me" button on out-of-stock product pages (theme app extension)
- [x] Email signup form (email required, phone optional)
- [x] Confirmation message after signup
- [x] Email notification when product restocked (with direct purchase link)

### 3.2 Admin Dashboard
- [x] Overview dashboard: active subscribers, notifications sent, click rate, attributed orders
- [x] Subscriber list with product, date, and status
- [x] Email template customization (logo, colors, message)
- [x] Enable/disable notifications per product or collection
- [x] Export subscribers to CSV

### 3.3 Backend
- [x] Shopify OAuth authentication
- [x] Webhook listener for `inventory_levels/update` (detect restocks)
- [x] Webhook listener for `products/update` (detect status changes)
- [x] Subscriber database (email, phone, product variant, timestamp)
- [x] Notification queue and delivery system (email via SendGrid)
- [x] App uninstall cleanup (delete all merchant data per Shopify requirements)

---

## 4. Explicit Exclusions (Not in MVP)

- SMS notifications (planned for v2 — requires Twilio integration and higher compliance)
- Push notifications (web push — planned for v3)
- Preorder payment functionality (planned for v2)
- Low-stock alerts (planned for v2)
- Analytics dashboard with charts (basic stats only in MVP)
- Multi-language support (English only in MVP)
- Mobile app
- AI-powered product recommendations
- Integration with other marketing platforms (Klaviyo, Mailchimp, etc.)

---

## 5. Shopify API Permissions & Data Requirements

### Required Scopes
| Scope | Purpose |
|-------|---------|
| `read_products` | Access product and variant information |
| `read_inventory` | Check inventory levels for restock detection |
| `read_locations` | Access location data for inventory |
| `read_customers` | Match subscribers to existing customer records |
| `write_customers` | Create customer records from subscribers (optional) |

### Webhooks
| Webhook Topic | Purpose |
|---------------|---------|
| `inventory_levels/update` | Detect when inventory level changes from 0 to positive |
| `products/update` | Detect when product status changes (active/draft) |
| `app/uninstalled` | Clean up merchant data on uninstall |
| `shop/update` | Track shop status changes |

### Data Storage
- **Subscribers:** email, phone (optional), product_id, variant_id, shop_domain, created_at, notified_at, status
- **Notifications:** subscriber_id, product_id, variant_id, sent_at, clicked_at, purchased_at
- **Shop data:** shop_domain, access_token, email settings, installed_at, uninstalled_at

---

## 6. Billing Approach

### Free Plan
- Up to 100 notifications/month
- Email only
- Basic dashboard
- Restock Radar branding in notification emails

### Pro Plan — $9/month
- Up to 1,000 notifications/month
- Custom email branding (no Restock Radar logo)
- Advanced analytics
- CSV export
- Priority email support

### Premium Plan — $29/month
- Up to 10,000 notifications/month
- SMS notifications (planned v2 feature)
- Custom sender name and reply-to
- API access
- Priority support

### Implementation
- Shopify Billing API (ApplicationCharge and RecurringApplicationCharge)
- 14-day free trial on paid plans
- Usage-based billing for overage

---

## 7. Security, Privacy & Uninstall Behavior

### Security
- All Shopify OAuth tokens stored encrypted
- HTTPS-only for all endpoints
- Webhook verification using HMAC signature
- Input validation on all subscriber forms
- Rate limiting on signup endpoint (prevent abuse)
- No exposed API keys or credentials (all via environment variables)

### Privacy
- GDPR compliant: subscriber data deletion on request
- No selling or sharing of subscriber data
- Clear privacy policy linked in app
- Data stored in EU/US regions based on merchant location
- No third-party data sharing

### Uninstall Behavior
- On `app/uninstalled` webhook: delete all subscriber data, notification logs, and merchant settings within 30 days
- Merchant can request immediate deletion via support
- Compliance with Shopify's data deletion requirements

---

## 8. Testing & Acceptance Criteria

### Unit Tests
- Subscriber creation and validation
- Webhook signature verification
- Inventory restock detection logic
- Notification queue processing
- Email template rendering

### Integration Tests
- OAuth flow: install → authorize → access token
- Webhook registration and delivery
- End-to-end: signup → restock → notification → click
- Uninstall: data cleanup verification

### Acceptance Criteria
1. Merchant can install the app in under 5 minutes
2. "Notify Me" button appears on out-of-stock products within 60 seconds of installation
3. Customer receives restock email within 5 minutes of inventory update
4. Dashboard accurately shows subscriber count and notification stats
5. Uninstall properly cleans up all data
6. No exposed credentials in client-side code
7. App passes Shopify App Store review requirements

---

## 9. Initial Pricing Hypotheses

| Tier | Price | Limits | Target |
|------|-------|--------|--------|
| Free | $0 | 100 notifications/month | Small stores, trial users |
| Pro | $9/month | 1,000 notifications/month | Growing stores with regular stockouts |
| Premium | $29/month | 10,000 notifications/month | High-volume stores, seasonal businesses |

**Hypothesis:** Most merchants will start on Free, convert to Pro after exhausting free limits, and upgrade to Premium during seasonal peaks. The $9 Pro tier is priced below most competitors' paid plans ($14-$29) to capture price-sensitive merchants.

---

## 10. Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | Remix (Shopify's recommended framework) |
| Runtime | Node.js |
| Frontend | React + Shopify Polaris |
| Database | Prisma + SQLite (dev) / PostgreSQL (prod) |
| Email | SendGrid API |
| Deployment | Fly.io or Railway |
| Package Manager | npm |
| Shopify CLI | Latest stable version |

---

## 11. Project Structure

```
restock-radar/
├── app/
│   ├── routes/
│   │   ├── _index.tsx          # Dashboard
│   │   ├── app._index.tsx      # App home
│   │   ├── app.subscribers.tsx # Subscriber list
│   │   ├── app.settings.tsx    # Settings
│   │   ├── auth.login.tsx      # OAuth login
│   │   ├── auth.callback.tsx  # OAuth callback
│   │   └── api.webhooks.tsx    # Webhook handler
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── SubscriberTable.tsx
│   │   ├── SettingsForm.tsx
│   │   └── NotifyButton.tsx
│   ├── models/
│   │   ├── subscriber.server.ts
│   │   ├── notification.server.ts
│   │   └── shop.server.ts
│   ├── services/
│   │   ├── shopify.server.ts
│   │   ├── email.server.ts
│   │   └── inventory.server.ts
│   └── db/
│       ├── schema.prisma
│       └── server.ts
├── extensions/
│   └── restock-notify/
│       └── blocks/
│           └── notify-button/
│               ├── notify-button.liquid
│               └── notify-button.liquid明日
├── package.json
├── shopify.app.toml
├── remix.config.js
├── .env.example
└── README.md
```
