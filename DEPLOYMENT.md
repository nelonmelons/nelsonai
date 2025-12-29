# Deploying Nelson AI to Vercel

## Prerequisites

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

## Deployment Steps

### 1. Set Environment Variables

Before deploying, you need to add your Gemini API key to Vercel:

```bash
vercel env add GEMINI_API_KEY
```

When prompted:

- Environment: Choose `Production`, `Preview`, and `Development`
- Value: Paste your API key: `AIzaSyCpSKJ9sl90-zh83b20BHVNtYROoMSARho`

### 2. Deploy to Vercel

From the project root:

```bash
# First deployment (will prompt for project setup)
vercel

# For production deployment
vercel --prod
```

### 3. Vercel Dashboard Setup

After first deployment:

1. Go to [vercel.com](https://vercel.com) and open your project
2. Go to **Settings** → **Environment Variables**
3. Add:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GEMINI_MODEL`: `gemini-1.5-flash-latest` (or `gemini-pro`)
   - `PORT`: `3001`

### 4. Redeploy

After setting environment variables:

```bash
vercel --prod
```

## Project Structure for Vercel

```
nelson-ai/
├── vercel.json          # Vercel configuration
├── client/              # Frontend (Vite + React)
│   └── dist/           # Built files (auto-generated)
└── server/             # Backend (Express + TypeScript)
    └── src/
        └── index.ts    # API entry point
```

## API Routes

Once deployed, your API will be available at:

- `https://your-app.vercel.app/api/chat`
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/reset`

## Troubleshooting

### API Key Not Working

If you see "GEMINI_API_KEY not found":

1. Check environment variables in Vercel dashboard
2. Redeploy after adding variables
3. Check logs: `vercel logs`

### Build Errors

If build fails:

```bash
# Test build locally first
cd client && npm run build
cd ../server && npm run build
```

### CORS Issues

If you encounter CORS errors, the `cors` middleware in `server/src/index.ts` should handle it. If issues persist, add your Vercel domain to the CORS whitelist.

## Continuous Deployment

Connect your GitHub repository to Vercel for automatic deployments:

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Every push to `main` branch will auto-deploy

## Local Development vs Production

- **Local**: Run `npm run dev` (uses localhost:3001 and localhost:5173)
- **Production**: Vercel serves static client from CDN and API from serverless functions

## Custom Domain (Optional)

1. Go to Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

🚀 Your Nelson AI app is now live on Vercel!
