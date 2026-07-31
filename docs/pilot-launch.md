# MEHKO Pilot Launch Checklist

Use this when recruiting **3–5 pilot cooks in one county** before switching Stripe to live mode.

## Before inviting cooks

- [ ] Stripe **test mode** E2E verified (cook subscribe, Connect, customer checkout, webhooks)
- [ ] Production env vars set on Vercel: `DATABASE_URL`, `SESSION_SECRET`, Stripe keys, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAILS`, `NOMINATIM_USER_AGENT`
- [ ] Legal pages live: Terms, Privacy, Cookies, Refunds
- [ ] `/api/health` returns `ok: true` and `stripeReady: true` on production

## Pick one county

- [ ] Choose a single county with active MEHKO adoption (see `/for-cooks/mehko-counties`)
- [ ] Confirm permit rules with the county environmental health department
- [ ] Prepare a one-page cook welcome email with links to Become a Cook + Cook signup

## Recruit 3–5 cooks

- [ ] Each cook has an approved or in-progress MEHKO permit
- [ ] Cook signs up at `/for-cooks/signup`
- [ ] Admin promotes role to COOK if needed (`ADMIN_EMAILS` + admin panel)
- [ ] Cook completes onboarding checklist: Connect → Subscribe → Kitchen → Menu

## Run real test orders

- [ ] 2–3 neighbors create member accounts and set delivery addresses in the pilot county
- [ ] Place test orders with Stripe test cards (`4242 4242 4242 4242`)
- [ ] Cook updates order status: Preparing → Ready → Completed
- [ ] Verify webhook updates subscription, Connect, and order payment status

## Go live (when LLC/EIN ready)

- [ ] Update Stripe business profile (LLC or sole prop as advised by your attorney/accountant)
- [ ] Swap to **live** Stripe keys on production Vercel env only
- [ ] Re-register webhook endpoint with live signing secret
- [ ] Run one small real-money order end-to-end before broad marketing

## Support during beta

- [ ] Monitor `/api/health` after each deploy
- [ ] Respond to refund requests within 48 hours (see `/legal/refunds`)
- [ ] Collect cook feedback on menu tools, order queue, and payout timing
