export type AboutMunchValueIcon = "transparency" | "wealth" | "community" | "voice"

export type AboutMunchInvolveIcon = "utensils" | "chef" | "map"

/** Hero subtitle */
export const aboutMunchIntro =
  "For the people, by the people. Learn what we stand for and how you can be part of it."

/** Mission statement — shown on /community/our-story */
export const missionStatement: string[] = [
  "Munch is for the people, by the people. Our goal is to bring the community together—not some of it, but all of it: the wonderful people around you who make your world continue to spin.",
  "That includes the ones who are often forgotten and left behind. The ones who are not used to reaping the benefits of their role in the community—roles that are just as important as any other.",
  "We are ready to do what it takes to work together to lift all of us up, and to remind us that we have everything we need right here.",
  "Munch is meant to serve as a reminder—and an example—that things can be different. Let's make community valuable again. Let's remind ourselves and the people we love that we're valuable again.",
  "None of this works without you. Without us. Munch is yours, too. Join the movement.",
]

export const values: Array<{
  title: string
  description: string
  icon: AboutMunchValueIcon
  linkHref?: string
  linkLabel?: string
}> = [
  {
    title: "Transparency",
    icon: "transparency",
    description:
      "We want you to know where your money is going—and how it directly benefits you personally, as well as your community.",
  },
  {
    title: "Wealth distribution",
    icon: "wealth",
    description:
      "Modern tech companies are all about hoarding wealth—making the rich richer while the rest of us suffer in silence. Here at Munch, we want to prove it doesn't have to be that way. By redistributing a portion of all profits, increasing accessibility to community services, and collective ownership, we aim to reduce exploitation at every step—from the people who cook to the neighbors who eat. Munch is here to prove there are other options. The money you put into your community should stay in your community. We want to create an avenue for people to lift themselves and their communities up.",
  },
  {
    title: "Community first",
    icon: "community",
    description:
      "To Munch, community means all members of the community. Regardless of socioeconomic status, race, religion, or ability, we are dedicated to serving your community as a whole and ensuring that everyone benefits tangibly from our service.",
  },
  {
    title: "Giving a voice to the people",
    icon: "voice",
    description:
      "Munch wants to know what you and your community need. What would you benefit from the most? How can we use the resources at our disposal to best serve your community?",
    linkHref: "/support/contact-us",
    linkLabel: "Contact us",
  },
]

export const getInvolvedLinks: Array<{
  title: string
  description: string
  href: string
  ctaLabel: string
  icon: AboutMunchInvolveIcon
}> = [
  {
    title: "Browse meals",
    description: "Discover homemade dishes from MEHKO kitchens near you and order for delivery.",
    href: "/restaurants",
    ctaLabel: "See what's cooking",
    icon: "utensils",
  },
  {
    title: "Become a cook",
    description: "Share your recipes with neighbors. We'll help you understand MEHKO steps and get started.",
    href: "/for-cooks/become-a-cook",
    ctaLabel: "Start cooking",
    icon: "chef",
  },
  {
    title: "Bring Munch to your neighborhood",
    description: "Help grow the network of home kitchens and eaters where you live.",
    href: "/for-cooks/bring-itk-to-your-neighborhood",
    ctaLabel: "Learn more",
    icon: "map",
  },
]
