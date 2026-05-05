"use client"

import { Facebook, Twitter, Instagram, Youtube, Leaf } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  community: [
    { label: "Our Story", href: "/community/our-story" },
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
  { icon: Twitter, label: "Twitter", href: "/support/social" },
  { icon: Instagram, label: "Instagram", href: "/support/social" },
  { icon: Youtube, label: "YouTube", href: "/support/social" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t-2 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-serif font-bold text-foreground">Munch</span>
              </div>
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
            <Link href="/legal/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
