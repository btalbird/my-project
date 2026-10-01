"use client"

import { Facebook, Instagram } from "lucide-react"
import Link from "next/link"

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
    </svg>
  )
}

const footerLinks = {
  community: [
    { label: "About Munch", href: "/community/our-story" },
    { label: "Local Cooks", href: "/community/local-cooks" },
    { label: "Community-led Spaces", href: "/community/community-events" },
    { label: "Food Donation", href: "/community/food-donation" },
  ],
  forCooks: [
    { label: "Cook Dashboard", href: "/for-cooks/cook-dashboard" },
    { label: "Earnings", href: "/for-cooks/earnings" },
  ],
  nutrition: [
    { label: "What is MEHKO", href: "/promos/2" },
    { label: "See County List", href: "/for-cooks/mehko-counties" },
    { label: "Get Permitted", href: "/for-cooks/become-a-cook" },
    { label: "Bring Munch to your Neighborhood", href: "/for-cooks/bring-itk-to-your-neighborhood" },
  ],
  support: [
    { label: "Help Center", href: "/support/help-center" },
    { label: "Contact Us", href: "/support/contact-us" },
    { label: "Food Safety", href: "/support/food-safety" },
    { label: "Accessibility", href: "/support/accessibility" },
  ],
}

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "/support/social" },
  { icon: XIcon, label: "X", href: "/support/social" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/munch.community", external: true },
  { icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@munch.community", external: true },
]

export function Footer() {
  return (
    <footer className="bg-card border-t-2 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- brand asset from /public */}
              <img
                src="/brand/munch-logo.png"
                alt="Munch"
                width={904}
                height={389}
                className="h-12 w-auto max-w-[min(360px,85vw)] object-contain object-left sm:h-14 sm:max-w-[400px]"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Connecting communities through wholesome, home-cooked meals made with love and fresh ingredients.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                  aria-label={social.label}
                  {...("external" in social && social.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Cooks */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">For Cooks</h3>
            <ul className="space-y-3">
              {footerLinks.forCooks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Become a Cook</h3>
            <ul className="space-y-3">
              {footerLinks.nutrition.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t-2 border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Munch. Made with love for our community.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/legal/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/legal/refunds" className="hover:text-primary transition-colors">Refunds</Link>
            <Link href="/legal/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
