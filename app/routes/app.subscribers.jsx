/**
 * Subscriber List — Shows all subscribers with filtering and CSV export
 */

import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Button,
  TextField,
  Select,
  Pagination,
  BlockStack,
  Text,
  Box,
  Divider,
  Toast,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";

import { authenticateAdmin } from "../shopify.server";
import { getSubscribers, getSubscriberCount } from "../models/subscriber.server";

export async function loader({ request }) {
  const { session } = await authenticateAdmin(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "all";
  const limit = 25;

  const subscribers = await getSubscribers(session.shop, { page, limit, search, status });
  const total = await getSubscriberCount(session.shop, { search, status });

  return json({ subscribers, total, page, limit, shop: session.shop });
}

export default function SubscribersPage() {
  const { subscribers, total, page, limit } = useLoaderData();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showToast, setShowToast] = useState(false);

  const rows = subscribers.map((sub) => [
    sub.email,
    sub.phone || "—",
    sub.productTitle.length > 35 ? sub.productTitle.substring(0, 35) + "..." : sub.productTitle,
    <Badge key={sub.id} tone={getBadgeTone(sub.status)}>
      {sub.status}
    </Badge>,
    new Date(sub.createdAt).toLocaleDateString(),
  ]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchValue) params.set("search", searchValue);
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("page", "1");
    navigate(`/app/subscribers?${params.toString()}`);
  };

  const handleExport = () => {
    setShowToast(true);
    window.location.href = "/app/subscribers/export";
  };

  return (
    <Page>
      <TitleBar title="Subscribers" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              {/* Filters */}
              <div style={{ padding: "16px 20px", display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Search"
                    value={searchValue}
                    onChange={setSearchValue}
                    placeholder="Email or product name..."
                    onEnter={handleSearch}
                  />
                </div>
                <div style={{ width: "180px" }}>
                  <Select
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { label: "All", value: "all" },
                      { label: "Active", value: "active" },
                      { label: "Notified", value: "notified" },
                      { label: "Purchased", value: "purchased" },
                      { label: "Unsubscribed", value: "unsubscribed" },
                    ]}
                  />
                </div>
                <Button onClick={handleSearch}>Filter</Button>
                <Button variant="primary" onClick={handleExport}>Export CSV</Button>
              </div>
              <Divider />
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={["Email", "Phone", "Product", "Status", "Date"]}
                rows={rows}
              />
              {total > limit && (
                <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "center" }}>
                  <Pagination
                    hasPrevious={page > 1}
                    hasNext={page * limit < total}
                    onPrevious={() => navigate(`/app/subscribers?page=${page - 1}`)}
                    onNext={() => navigate(`/app/subscribers?page=${page + 1}`)}
                  />
                </div>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      {showToast && (
        <Toast content="Exporting subscribers..." onDismiss={() => setShowToast(false)} />
      )}
    </Page>
  );
}

function getBadgeTone(status) {
  switch (status) {
    case "active": return "success";
    case "notified": return "info";
    case "purchased": return "primary";
    case "unsubscribed": return "critical";
    default: return "neutral";
  }
}
