/**
 * Dashboard — Main app page
 * Shows overview of subscribers, notifications sent, click rate, attributed orders
 */

import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  DataTable,
  Badge,
  Button,
  ButtonGroup,
  Box,
  Divider,
  AlphaCard,
  AlphaStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/node";

import { authenticateAdmin } from "../shopify.server";
import { getDashboardStats, getRecentSubscribers } from "../models/dashboard.server";

export async function loader({ request }) {
  const { admin, session } = await authenticateAdmin(request);
  const shop = session.shop;
  const stats = await getDashboardStats(shop);
  const recentSubs = await getRecentSubscribers(shop, 10);
  return json({ stats, recentSubs, shop });
}

export default function Dashboard() {
  const { stats, recentSubs, shop } = useLoaderData();
  const navigate = useNavigate();

  const rows = recentSubs.map((sub) => [
    sub.email,
    sub.productTitle.length > 40 ? sub.productTitle.substring(0, 40) + "..." : sub.productTitle,
    <Badge key={sub.id} tone={sub.status === "active" ? "success" : sub.status === "notified" ? "info" : "critical"}>
      {sub.status}
    </Badge>,
    new Date(sub.createdAt).toLocaleDateString(),
  ]);

  return (
    <Page>
      <TitleBar title="Restock Radar Dashboard" />
      <Layout>
        {/* Stats Row */}
        <Layout.Section>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <StatCard label="Active Subscribers" value={stats.activeSubscribers} />
            <StatCard label="Notifications Sent" value={stats.notificationsSent} />
            <StatCard label="Click Rate" value={`${stats.clickRate}%`} />
            <StatCard label="Attributed Orders" value={stats.attributedOrders} />
          </div>
        </Layout.Section>

        {/* Recent Subscribers */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="headingMd" as="h2">Recent Subscribers</Text>
                  <ButtonGroup>
                    <Button onClick={() => navigate("/app/subscribers")}>View All</Button>
                    <Button variant="primary" onClick={() => navigate("/app/settings")}>Settings</Button>
                  </ButtonGroup>
                </div>
              </div>
              <Divider />
              {rows.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Email", "Product", "Status", "Date"]}
                  rows={rows}
                />
              ) : (
                <Box padding="400">
                  <Text as="p" tone="subdued">No subscribers yet. Once customers start signing up for restock alerts, they'll appear here.</Text>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ padding: "16px 20px" }}>
                <Text variant="headingMd" as="h2">Quick Actions</Text>
              </div>
              <Divider />
              <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <QuickAction
                  title="Customize Email"
                  description="Update your notification email template with your brand logo and colors"
                  buttonText="Edit Template"
                  onClick={() => navigate("/app/settings")}
                />
                <QuickAction
                  title="Export Subscribers"
                  description="Download your subscriber list as a CSV file"
                  buttonText="Export CSV"
                  onClick={() => navigate("/app/subscribers/export")}
                />
                <QuickAction
                  title="View Products"
                  description="See which products have the most restock requests"
                  buttonText="View Products"
                  onClick={() => navigate("/app/products")}
                />
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="200">
          <Text as="p" tone="subdued" variant="sm">{label}</Text>
          <Text as="p" variant="heading2xl">{value}</Text>
        </BlockStack>
      </Box>
    </Card>
  );
}

function QuickAction({ title, description, buttonText, onClick }) {
  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="300">
          <Text as="p" variant="headingSm">{title}</Text>
          <Text as="p" tone="subdued" variant="sm">{description}</Text>
          <Button onClick={onClick} size="slim">{buttonText}</Button>
        </BlockStack>
      </Box>
    </Card>
  );
}
