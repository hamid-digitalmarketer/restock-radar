/**
 * Settings — Email template customization, brand settings, plan management
 */

import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Text,
  BlockStack,
  Box,
  Divider,
  Select,
  Checkbox,
  Banner,
  Stack,
  Thumbnail,
  DropZone,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";

import { authenticateAdmin } from "../shopify.server";
import { getShopSettings, updateShopSettings } from "../models/shop.server";

export async function loader({ request }) {
  const { session } = await authenticateAdmin(request);
  const settings = await getShopSettings(session.shop);
  return json({ settings, shop: session.shop });
}

export async function action({ request }) {
  const { session } = await authenticateAdmin(request);
  const formData = await request.formData();

  const settings = {
    emailFromName: formData.get("emailFromName"),
    emailReplyTo: formData.get("emailReplyTo"),
    brandColor: formData.get("brandColor"),
    logoUrl: formData.get("logoUrl"),
    emailSubject: formData.get("emailSubject"),
    emailBody: formData.get("emailBody"),
    includeBranding: formData.get("includeBranding") === "true",
  };

  await updateShopSettings(session.shop, settings);
  return json({ success: true });
}

export default function SettingsPage() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();

  const [emailFromName, setEmailFromName] = useState(settings.emailFromName || "Restock Radar");
  const [emailReplyTo, setEmailReplyTo] = useState(settings.emailReplyTo || "");
  const [brandColor, setBrandColor] = useState(settings.brandColor || "#000000");
  const [emailSubject, setEmailSubject] = useState(settings.emailSubject || "Good news! {{product_title}} is back in stock!");
  const [emailBody, setEmailBody] = useState(settings.emailBody || "Hi there,\n\nGreat news! {{product_title}} is back in stock at {{shop_name}}.\n\nClick here to get yours: {{product_url}}\n\nThanks for waiting!");
  const [includeBranding, setIncludeBranding] = useState(settings.includeBranding !== false);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("emailFromName", emailFromName);
    formData.append("emailReplyTo", emailReplyTo);
    formData.append("brandColor", brandColor);
    formData.append("emailSubject", emailSubject);
    formData.append("emailBody", emailBody);
    formData.append("includeBranding", String(includeBranding));
    submit(formData, { method: "post" });
  };

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        {/* Email Branding */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ padding: "16px 20px" }}>
                <Text variant="headingMd" as="h2">Email Branding</Text>
              </div>
              <Divider />
              <div style={{ padding: "0 20px" }}>
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="From Name"
                      value={emailFromName}
                      onChange={setEmailFromName}
                      helpText="The name that appears as the email sender"
                    />
                    <TextField
                      label="Reply-To Email"
                      type="email"
                      value={emailReplyTo}
                      onChange={setEmailReplyTo}
                      placeholder="noreply@yourstore.com"
                      helpText="Replies to restock emails go here"
                    />
                  </FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      label="Brand Color"
                      value={brandColor}
                      onChange={setBrandColor}
                      placeholder="#000000"
                      helpText="Used for buttons and headings in the email"
                    />
                    <Checkbox
                      label="Include 'Powered by Restock Radar'"
                      checked={includeBranding}
                      onChange={setIncludeBranding}
                      helpText="Uncheck on Pro plan to remove branding"
                    />
                  </FormLayout.Group>
                </FormLayout>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Email Template */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div style={{ padding: "16px 20px" }}>
                <Text variant="headingMd" as="h2">Email Template</Text>
              </div>
              <Divider />
              <div style={{ padding: "0 20px" }}>
                <BlockStack gap="400">
                  <TextField
                    label="Subject Line"
                    value={emailSubject}
                    onChange={setEmailSubject}
                    helpText="Available variables: {{product_title}}, {{shop_name}}"
                  />
                  <TextField
                    label="Email Body"
                    value={emailBody}
                    onChange={setEmailBody}
                    multiline={6}
                    helpText="Available variables: {{product_title}}, {{shop_name}}, {{product_url}}, {{customer_name}}"
                  />
                  <Banner tone="info">
                    <p>Use <code>{"{{product_title}}"}</code>, <code>{"{{product_url}}"}</code>, <code>{"{{shop_name}}"}</code>, and <code>{"{{customer_name}}"}</code> to personalize emails.</p>
                  </Banner>
                </BlockStack>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Save Button */}
        <Layout.Section>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" onClick={handleSave}>Save Settings</Button>
          </div>
        </Layout.Section>

        {/* Success Banner */}
        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success" title="Settings saved">
              Your email template and branding have been updated successfully.
            </Banner>
          </Layout.Section>
        )}

        {/* Plan Info */}
        <Layout.Section>
          <Card>
            <div style={{ padding: "16px 20px" }}>
              <Text variant="headingMd" as="h2">Your Plan</Text>
            </div>
            <Divider />
            <div style={{ padding: "16px 20px" }}>
              <BlockStack gap="300">
                <Stack distribution="equalSpacing">
                  <Text as="p" variant="bodyLg">Current Plan</Text>
                  <Text as="p" variant="headingMd" tone={settings.plan === "free" ? "subdued" : "success"}>
                    {settings.plan ? settings.plan.toUpperCase() : "FREE"}
                  </Text>
                </Stack>
                <Stack distribution="equalSpacing">
                  <Text as="p" variant="bodyLg">Monthly Notifications</Text>
                  <Text as="p" variant="bodyMd">
                    {settings.plan === "free" ? "100 / month" :
                     settings.plan === "pro" ? "1,000 / month" :
                     settings.plan === "premium" ? "10,000 / month" : "100 / month"}
                  </Text>
                </Stack>
                <Box paddingBlock="200">
                  <Button url="/app/upgrade">Upgrade Plan</Button>
                </Box>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
