# Installation & Deployment Instructions — Restock Radar

## Prerequisites

- Node.js 18+
- npm (or yarn)
- Shopify Partner account
- Development Shopify store

## Step 1: Clone the Repository

```bash
git clone https://github.com/hamid-digitalmarketer/restock-radar.git
cd restock-radar
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your Shopify app credentials:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-app-url.com
SHOPIFY_APP_SHOPIFY_EMAIL=admin@yourstore.com

DATABASE_URL="file:./dev.db"

SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_API_KEY=your_twilio_api_key
```

## Step 4: Set Up the Database

```bash
npx prisma migrate dev
npx prisma db seed
```

## Step 5: Start the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`.

## Step 6: Install the App on a Development Store

1. Open your Shopify Partner Dashboard
2. Create a new development store (or use an existing one)
3. In the app's `shopify.app.toml`, set your app URL
4. Run `npm run deploy` to deploy the app
5. Install the app on your development store
6. Complete the OAuth flow
7. Test the app on your development store

## Step 7: Submit to Shopify App Store

1. Open the Shopify Partner Dashboard
2. Navigate to your app
3. Click "Submit for review"
4. Fill out the app listing form
5. Submit

## Troubleshooting

### Common Issues

#### "Invalid API key" error
- Verify your `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET` are correct
- Check that your app is properly configured in the Shopify Partner Dashboard

#### "Database connection failed" error
- Verify your `DATABASE_URL` is correct
- Run `npx prisma migrate dev` to create the database
- Check that the database file exists and is not locked

#### "Webhook signature verification failed" error
- Verify your app's webhook URL is set correctly
- Check that the webhook topics are registered
- Ensure your server is publicly accessible

#### "Email not sent" error
- Verify your SendGrid API key is correct
- Check your SendGrid account has sufficient credits
- Verify the email address is not on a blocklist

#### "App not loading" error
- Check your app URL is set correctly
- Verify your app is deployed and running
- Check the browser console for JavaScript errors

### Support

If you encounter issues, please contact:
- **Email:** support@restock-radar.com
- **GitHub:** https://github.com/hamid-digitalmarketer/restock-radar/issues
- **WhatsApp:** https://wa.me/923167417135

## Production Deployment

### Option 1: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/get/fly.sh | sh

# Sign in
fly auth signin

# Deploy
fly deploy
```

### Option 2: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Sign in
railway login

# Deploy
railway up
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Environment Variables for Production

| Variable | Description | Required |
|----------|-------------|----------|
| SHOPIFY_API_KEY | Your Shopify app API key | Yes |
| SHOPIFY_API_SECRET | Your Shopify app API secret | Yes |
| SHOPIFY_APP_URL | Your app URL (e.g., https://restock-radar.example.com) | Yes |
| DATABASE_URL | Database connection string | Yes |
| SENDGRID_API_KEY | Email sending API key | Yes |
| TWILIO_API_KEY | SMS sending API key | No (v2 feature) |
| SESSION_COOKIE_NAME | Session cookie name | No |
| SESSION_COOKIE_DOMAIN | Session cookie domain | No |
| SESSION_COOKIE_SECURE | Session cookie secure flag | No |
| SESSION_COOKIE_SAME_SITE | Session cookie same-site policy | No |
| SESSION_COOKIE_HTTPONLY | Session cookie HTTP-only flag | No |
| LOG_LEVEL | Logging level (info, debug, warn, error) | No |
| DEBUG | Debug mode (true/false) | No |

## Uninstall Instructions

When a merchant uninstalls the app:
1. The `app/uninstalled` webhook is triggered
2. All merchant data is deleted from the database
3. The merchant is removed from the subscriber list
4. All pending notifications are cancelled
5. The merchant is removed from the shop table

This ensures compliance with Shopify's data deletion requirements.

## License

MIT