# Contact form: Cloudflare setup

The İletişim / Contact page has a form instead of a published email address. The form sends to
`katolikdunyasi.com/api/contact`, where a small Cloudflare Worker (`contact-worker.js` in this
folder) does three things:

1. It checks the message with Cloudflare Turnstile and a hidden trap field.
2. It emails the message to you.
3. It sets the visitor's address as the Reply-To, so "Reply" in your mail goes straight to them.

Your own address is stored only in Cloudflare, never on the site.

Your existing routed address (the "fake" one that forwards to your personal email) keeps working
as it is. The Worker sends to your personal address, which Email Routing has already verified.

## Step 1: Turnstile (the spam check)

1. Cloudflare dashboard → **Protect & Connect → Application security → Turnstile** → **Add widget** (skip the "Turnstile Spin" offer).
2. **Widget name:** `katolikdunyasi contact`.
3. **Hostnames:** add `katolikdunyasi.com` (and `www.katolikdunyasi.com` if you use it).
4. **Widget mode:** **Managed**. **Pre-clearance:** No.
5. Click **Create**. Copy the two keys it shows:
   - **Site key** (public): send it to me, and I'll put it in the site.
   - **Secret key** (private): keep it for Step 3. Don't send it to anyone, including me.

## Step 2: Check Email Routing

1. Dashboard → your domain **katolikdunyasi.com** → **Email** → **Email Routing**.
2. Under **Destination addresses**, your personal address should show **Verified**. It already is
   if your current forwarding works.
3. Nothing else changes here. Your existing forwarding rule stays exactly as it is.

## Step 3: Create the Worker

1. Go to the account home, not the domain, and open **Workers & Pages**. Press Ctrl+K and type "Workers" if it isn't in the menu.
2. **Create** (or **Create application**) → **Start with Hello World!** → name it `katolikdunyasi-contact` → **Deploy**.
3. The code, the route, the `CONTACT_EMAIL` and `CONTACT_LIMIT` bindings and `FROM_ADDRESS` come
   from this folder: `.github/workflows/deploy-contact.yml` publishes `contact-worker.js` with
   `wrangler.jsonc` whenever something in `cloudflare/` changes. Don't edit the code in the dashboard:
   the next deploy replaces it.
4. Go back to the Worker → **Settings** → **Variables and Secrets** → **Add**:

   | Type | Name | Value |
   |---|---|---|
   | Secret | `TURNSTILE_SECRET` | the Turnstile **secret key** from Step 1 |
   | Secret | `TO_ADDRESS` | your personal email (the verified destination) |

   `FROM_ADDRESS` (`form@katolikdunyasi.com`, set in `wrangler.jsonc`) doesn't need to exist as a
   real mailbox. It only has to be an address at katolikdunyasi.com.

## Step 4: Connect the Worker to the site

The route `katolikdunyasi.com/api/*` is in `wrangler.jsonc`, so each deploy sets it.

Only `/api/...` addresses go to the Worker. Every page of the site is still served from GitHub
Pages exactly as before.

## Step 5: The site key

The site key is already in the build (`$TurnstileSiteKey` in tools/build.ps1). If the widget is
ever recreated, put the new site key there.

## Step 6: Test it once it's live

1. Open katolikdunyasi.com/iletisim.html, fill in the form, and send it.
2. The message arrives in your personal inbox from `form@katolikdunyasi.com`, with a subject like
   "Katolik Dünyası: name". Pressing Reply answers the visitor directly.
3. If nothing arrives, open the Worker → **Logs** (real-time) and send the form again. Any error
   (for example a missing secret) shows there.

## If you ever want to change something

- **Your receiving address:** change the `TO_ADDRESS` secret (Step 3.4). It must be a verified
  destination in Email Routing.
- **Turn the form off:** take the route out of `wrangler.jsonc` and delete it under the Worker →
  **Settings** → **Domains & Routes**. The page stays, but sending stops.
