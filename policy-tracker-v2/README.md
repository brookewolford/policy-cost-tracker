# The Real Cost of Trump Policy — Live Tracker v2
### By B.M. Wolford / BMW Substack

This version integrates the **US Treasury Fiscal Data API** to automatically
pull real outlay data for DHS (ICE/immigration) and DoD (Iran war) every month.
No manual updates needed for those categories.

---

## What updates automatically vs manually

| Category | How it updates |
|---|---|
| DHS / ICE / Immigration | ✅ Auto — US Treasury API (monthly) |
| DoD / Iran War | ✅ Auto — US Treasury API (monthly) |
| Tax Cuts Deficit Cost | Manual — update when CBO re-scores |
| Medicaid & SNAP Cuts | Manual — update when CBO re-scores |
| DOJ Anti-Weaponization Fund | Manual — one-time allocation |
| White House Ballroom | Manual — update if Congress approves more |
| Litigation Defense | Manual — rough estimate |

---

## Deploy to Vercel (Free)

### Step 1: GitHub
1. Go to https://github.com and sign up / log in
2. Click "+" → "New repository"
3. Name: `policy-cost-tracker` — set to Public
4. Click "Create repository"
5. Upload ALL files maintaining this exact folder structure:
   ```
   policy-tracker-v2/
   ├── api/
   │   └── treasury.js        ← Vercel serverless function
   ├── public/
   │   └── index.html
   ├── src/
   │   ├── index.js
   │   └── App.js
   ├── package.json
   └── vercel.json
   ```

### Step 2: Vercel
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New Project"
3. Select your `policy-cost-tracker` repo
4. Vercel auto-detects settings from vercel.json
5. Click **Deploy**
6. Live in ~2 minutes at `policy-cost-tracker.vercel.app`

That's it. The Treasury API integration works automatically once deployed.

---

## Manually updating CBO figures

When CBO releases a new score or major news confirms a new number:

1. Go to your GitHub repo
2. Click `src/App.js` → click the pencil icon to edit
3. Find `STATIC_CATEGORIES` near the top
4. Update `baseAmount` and `lastUpdated` for the relevant item
5. Click "Commit changes"

Vercel redeploys automatically within ~60 seconds.

---

## How the Treasury integration works

The file `api/treasury.js` is a Vercel Serverless Function.
When the frontend loads, it calls `/api/treasury`, which:

1. Hits `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5`
2. Pulls the latest MTS Table 5 data (outlays by agency)
3. Finds DHS and DoD rows
4. Returns actual YTD outlay figures in dollars
5. Caches the result for 6 hours (Treasury only updates monthly anyway)

The Treasury API is:
- Free
- No API key required
- No registration required
- Published by the Bureau of the Fiscal Service
- Updated ~8th business day of each month

---

## Add to Substack

**Best approach for engagement:**
Take a screenshot of the live tracker → embed as image in Substack post →
hyperlink the image to your Vercel URL.

**Substack link card:**
Paste your Vercel URL directly into a post. Substack renders it as a
preview card using the Open Graph meta tags already built into this project.

**In your bio/about:**
Add the Vercel URL as a featured link.

---

## Custom domain (~$12/year, optional)
1. Buy a domain (Namecheap, Google Domains)
2. Vercel dashboard → your project → Settings → Domains
3. Add domain, follow DNS instructions

Suggested: `tracker.bmwolford.com` or `costs.bmwolford.com`

---

Sources: US Treasury Fiscal Data API · CBO · Tax Foundation · Brennan Center ·
National Immigration Forum · Pentagon Congressional Testimony · AP · NPR · CBS · CNN
