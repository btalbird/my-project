import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/** Default demo password; override with DEMO_USER_PASSWORD when generating a new hash. */
const DEMO_EMAIL = "demo@munch.com"
const DEMO_COOK_EMAIL = "cook@munch.com"
const demoPassword = process.env.DEMO_USER_PASSWORD ?? "demo1234"
const demoCookPassword = process.env.DEMO_COOK_PASSWORD ?? demoPassword

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

function inferCategorySlug(r) {
  const cuisine = String(r.cuisine ?? "")
  const tags = Array.isArray(r.tagSlugs) ? r.tagSlugs : []
  const name = String(r.name ?? "")

  if (/\bpizza\b/i.test(cuisine) || /\bpizza\b/i.test(name)) return "pizza"
  if (/\bsushi\b/i.test(cuisine) || /\bsushi\b/i.test(name) || r.image === "🍣") return "sushi"

  if (tags.includes("coffee") || /\bcoffee\b/i.test(cuisine)) return "coffee"
  if (tags.includes("breakfast") || /\bbreakfast\b/i.test(cuisine)) return "breakfast"
  if (tags.includes("desserts") || /\bdesserts\b/i.test(cuisine)) return "desserts"
  if (tags.includes("seafood") || /\bseafood\b/i.test(cuisine)) return "seafood"
  if (tags.includes("healthy") || /\bhealthy\b/i.test(cuisine)) return "healthy"

  const cuisineOrder = [
    "korean",
    "mexican",
    "japanese",
    "indian",
    "italian",
    "chinese",
    "thai",
    "vietnamese",
    "greek",
    "mediterranean",
    "middle-eastern",
    "caribbean",
    "ethiopian",
    "filipino",
    "persian",
  ]
  for (const c of cuisineOrder) if (tags.includes(c)) return c

  // Fallback: try to match any category-like slug in tags
  const known = new Set([
    "korean",
    "pizza",
    "mexican",
    "japanese",
    "sushi",
    "indian",
    "italian",
    "chinese",
    "thai",
    "vietnamese",
    "greek",
    "mediterranean",
    "middle-eastern",
    "caribbean",
    "ethiopian",
    "filipino",
    "persian",
    "desserts",
    "healthy",
    "breakfast",
    "coffee",
    "seafood",
  ])
  for (const t of tags) if (known.has(t)) return t
  return null
}

/** Demo MEHKO kitchen locations cluster near downtown LA (~10 mi spread) for radius testing. */
const KITCHEN_HUB_LAT = 34.0522
const KITCHEN_HUB_LNG = -118.2437

function kitchenLatLng(index, total) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const t = total <= 1 ? 0 : index / (total - 1)
  const rMi = 0.25 + t * 9.5
  const theta = index * golden
  const miLat = rMi * Math.cos(theta)
  const miLng = rMi * Math.sin(theta)
  const dLat = miLat / 69
  const dLng = miLng / (69 * Math.cos((KITCHEN_HUB_LAT * Math.PI) / 180))
  return {
    latitude: KITCHEN_HUB_LAT + dLat,
    longitude: KITCHEN_HUB_LNG + dLng,
    isMehko: true,
  }
}

const categories = [
  "Korean",
  "Pizza",
  "Mexican",
  "Japanese",
  "Sushi",
  "Indian",
  "Italian",
  "Chinese",
  "Thai",
  "Vietnamese",
  "Greek",
  "Mediterranean",
  "Middle Eastern",
  "Caribbean",
  "Ethiopian",
  "Filipino",
  "Persian",
  "Desserts",
  "Healthy",
  "Breakfast",
  "Coffee",
  "Seafood",
].map((name) => ({
  name,
  slug: slugify(name),
}))

const restaurants = [
  {
    name: "Burger Palace",
    image: "🍔",
    cuisine: "American • Burgers • Fast Food",
    rating: 4.8,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.99",
    promo: "20% OFF",
    tagSlugs: ["american", "fast-delivery"],
  },
  {
    name: "Pizza Paradise",
    image: "🍕",
    cuisine: "Italian • Pizza • Pasta",
    rating: 4.6,
    deliveryTime: "20-30 min",
    deliveryFee: "$0.99",
    promo: null,
    categorySlug: "pizza",
    tagSlugs: ["italian", "under-10"],
  },
  {
    name: "Sushi Master",
    image: "🍣",
    cuisine: "Japanese • Sushi • Asian",
    rating: 4.9,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.99",
    promo: "Free Delivery",
    categorySlug: "sushi",
    tagSlugs: ["japanese", "seafood"],
  },
  {
    name: "Taco Fiesta",
    image: "🌮",
    cuisine: "Mexican • Tacos • Burritos",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.49",
    promo: null,
    tagSlugs: ["mexican", "fast-delivery"],
  },
  {
    name: "Noodle House",
    image: "🍜",
    cuisine: "Chinese • Noodles • Asian",
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: "$1.99",
    promo: "15% OFF",
    tagSlugs: ["chinese", "spicy"],
  },
  {
    name: "Curry Kingdom",
    image: "🍛",
    cuisine: "Indian • Curry • Rice",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.49",
    promo: null,
    tagSlugs: ["indian", "spicy"],
  },
  // Diverse additional options (Guess Who grid feels full)
  { name: "Seoul Street Kitchen", image: "🥘", cuisine: "Korean • Bibimbap • Comfort", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$1.49", promo: null, tagSlugs: ["korean", "fast-delivery"] },
  { name: "Mediterranean Mezze", image: "🥙", cuisine: "Mediterranean • Wraps • Healthy", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["mediterranean", "gluten-free"] },
  { name: "Vegan Garden Bowls", image: "🥗", cuisine: "Plant-Based • Bowls • Fresh", rating: 4.8, deliveryTime: "20-30 min", deliveryFee: "$1.99", promo: "Vegan Picks", tagSlugs: ["healthy", "vegan", "vegetarian"] },
  { name: "Bangkok Basil", image: "🍲", cuisine: "Thai • Curry • Noodles", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["thai", "spicy"] },
  { name: "Pho & Friends", image: "🍜", cuisine: "Vietnamese • Pho • Broth", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["vietnamese", "under-10"] },
  { name: "Caribbean Jerk Joint", image: "🍗", cuisine: "Caribbean • Jerk • Island", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["caribbean", "spicy"] },
  { name: "Ethiopian Injera House", image: "🥘", cuisine: "Ethiopian • Stews • Injera", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$3.49", promo: null, tagSlugs: ["ethiopian", "gluten-free"] },
  { name: "Lebanese Lemon & Mint", image: "🍋", cuisine: "Lebanese • Grill • Mezze", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.39", promo: null, tagSlugs: ["lebanese", "fast-delivery"] },
  { name: "Café Con Leche", image: "☕", cuisine: "Coffee • Pastries • Café", rating: 4.5, deliveryTime: "15-25 min", deliveryFee: "$0.99", promo: "Morning Deal", tagSlugs: ["coffee", "under-10"] },
  { name: "Breakfast Bento", image: "🥞", cuisine: "Breakfast • Pancakes • Eggs", rating: 4.6, deliveryTime: "15-25 min", deliveryFee: "$1.09", promo: null, tagSlugs: ["breakfast", "fast-delivery"] },
  { name: "Sicilian Slice & Salad", image: "🍕", cuisine: "Italian • Pizza • Salads", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.29", promo: null, tagSlugs: ["italian", "under-10"] },
  { name: "Sushi & Sashimi Studio", image: "🍣", cuisine: "Japanese • Sushi • Seafood", rating: 4.9, deliveryTime: "25-35 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["japanese", "seafood"] },
  { name: "Dim Sum Corner", image: "🥟", cuisine: "Chinese • Dumplings • Dim Sum", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$1.79", promo: null, tagSlugs: ["chinese", "under-10"] },
  { name: "Kebab & Kofta", image: "🍢", cuisine: "Middle Eastern • Kebabs • Grill", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["middle-eastern", "fast-delivery"] },
  { name: "Fresh Poke Bar", image: "🐟", cuisine: "Hawaiian • Poke • Seafood", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["hawaiian", "seafood"] },
  { name: "Peruvian Pollo", image: "🍗", cuisine: "Peruvian • Rotisserie • Sides", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["peruvian", "fast-delivery"] },
  { name: "Greek Gyro Garden", image: "🥙", cuisine: "Greek • Gyros • Salads", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$1.69", promo: null, tagSlugs: ["greek", "under-10"] },
  { name: "Moroccan Tagine Table", image: "🍲", cuisine: "Moroccan • Tagine • Spice", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$3.19", promo: null, tagSlugs: ["moroccan", "spicy"] },
  { name: "Gluten-Free Goodness", image: "🌾", cuisine: "Gluten-Free • Comfort • Baked", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.09", promo: null, tagSlugs: ["healthy", "gluten-free"] },
  { name: "Veggie Dumpling Co.", image: "🥟", cuisine: "Vegetarian • Dumplings • Asian", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.59", promo: null, tagSlugs: ["vegetarian", "under-10"] },
  { name: "Spice Route Biryani", image: "🍚", cuisine: "Indian • Biryani • Aromatic", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["indian", "spicy"] },
  { name: "K-Town Fried Chicken", image: "🍗", cuisine: "Korean • Fried Chicken • Crispy", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["korean", "spicy"] },
  { name: "Island Seafood Shack", image: "🦐", cuisine: "Seafood • Shrimp • Grill", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.79", promo: null, tagSlugs: ["seafood", "fast-delivery"] },
  { name: "Sweet Treats Bakery", image: "🧁", cuisine: "Desserts • Bakery • Coffee", rating: 4.9, deliveryTime: "15-20 min", deliveryFee: "$0.99", promo: "Buy 1 Get 1", tagSlugs: ["desserts", "under-10", "coffee"] },
  { name: "Tropical Smoothie Spot", image: "🥤", cuisine: "Healthy • Smoothies • Fruit", rating: 4.5, deliveryTime: "15-25 min", deliveryFee: "$1.19", promo: null, tagSlugs: ["healthy", "fast-delivery"] },
  { name: "Ramen Night", image: "🍜", cuisine: "Japanese • Ramen • Noodles", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.39", promo: null, tagSlugs: ["japanese", "spicy"] },
  { name: "Taqueria Verde", image: "🌮", cuisine: "Mexican • Tacos • Street Food", rating: 4.6, deliveryTime: "15-25 min", deliveryFee: "$1.39", promo: null, tagSlugs: ["mexican", "under-10"] },
  { name: "Banh Mi & Bowls", image: "🥖", cuisine: "Vietnamese • Sandwiches • Fresh", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.49", promo: null, tagSlugs: ["vietnamese", "fast-delivery"] },
  { name: "Canton Wok", image: "🥡", cuisine: "Chinese • Stir Fry • Classics", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$1.49", promo: null, tagSlugs: ["chinese", "fast-delivery"] },
  { name: "West African Jollof House", image: "🍚", cuisine: "West African • Jollof • Grill", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$3.29", promo: null, tagSlugs: ["west-african", "spicy"] },
  { name: "Filipino Fiesta Kitchen", image: "🍛", cuisine: "Filipino • Adobo • Comfort", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["filipino", "fast-delivery"] },
  { name: "Cajun Crawfish Co.", image: "🦞", cuisine: "Cajun • Seafood • Boil", rating: 4.6, deliveryTime: "30-40 min", deliveryFee: "$3.49", promo: null, tagSlugs: ["cajun", "seafood", "spicy"] },
  { name: "Brazilian Bowl & BBQ", image: "🥩", cuisine: "Brazilian • BBQ • Bowls", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$3.19", promo: null, tagSlugs: ["brazilian", "fast-delivery"] },
  { name: "Argentinian Empanadas", image: "🥟", cuisine: "Argentinian • Empanadas • Baked", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["argentinian", "under-10"] },
  { name: "Persian Saffron Table", image: "🍚", cuisine: "Persian • Kebabs • Rice", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$3.29", promo: null, tagSlugs: ["persian", "gluten-free"] },
  { name: "Fusion Street Eats", image: "🌯", cuisine: "Fusion • Wraps • Global", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$1.79", promo: null, tagSlugs: ["fusion", "fast-delivery"] },
  { name: "Plant Power Tacos", image: "🌮", cuisine: "Mexican • Vegan • Tacos", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$1.99", promo: null, tagSlugs: ["mexican", "vegan", "spicy"] },
  { name: "Coastal Pescatarian", image: "🐟", cuisine: "Seafood • Healthy • Bowls", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["seafood", "healthy", "gluten-free"] },
  { name: "Neighborhood Naan & Kebab", image: "🥙", cuisine: "Indian • Grill • Street", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["indian", "fast-delivery"] },
  { name: "Keto Kitchen", image: "🥑", cuisine: "Healthy • Low Carb • Bowls", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$2.09", promo: null, tagSlugs: ["healthy", "gluten-free"] },
  { name: "Garden Falafel", image: "🧆", cuisine: "Middle Eastern • Vegetarian • Falafel", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.69", promo: null, tagSlugs: ["middle-eastern", "vegetarian", "under-10"] },
  { name: "Soba & Salad", image: "🍜", cuisine: "Japanese • Healthy • Noodles", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$2.09", promo: null, tagSlugs: ["japanese", "healthy"] },
  { name: "Dessert Pantry", image: "🍰", cuisine: "Desserts • Cakes • Treats", rating: 4.8, deliveryTime: "15-25 min", deliveryFee: "$1.19", promo: null, tagSlugs: ["desserts", "fast-delivery"] },

  // +50 more unique options
  { name: "Oaxaca Mole Kitchen", image: "🍛", cuisine: "Mexican • Mole • Comfort", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["mexican", "spicy"] },
  { name: "Yucatán Citrus Tacos", image: "🌮", cuisine: "Mexican • Citrus • Street Food", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.49", promo: null, tagSlugs: ["mexican", "fast-delivery", "under-10"] },
  { name: "Napoli Neighborhood Pies", image: "🍕", cuisine: "Italian • Pizza • Classic", rating: 4.8, deliveryTime: "20-30 min", deliveryFee: "$1.29", promo: "2-for-1 Slices", tagSlugs: ["italian", "under-10"] },
  { name: "Tuscan Pasta & Greens", image: "🍝", cuisine: "Italian • Pasta • Salads", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["italian", "healthy"] },
  { name: "Kyoto Ramen Workshop", image: "🍜", cuisine: "Japanese • Ramen • Broth", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.39", promo: null, tagSlugs: ["japanese", "spicy"] },
  { name: "Osaka Okonomiyaki Corner", image: "🥞", cuisine: "Japanese • Savory Pancakes • Street", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["japanese", "under-10"] },
  { name: "Busan Seafood Soup", image: "🍲", cuisine: "Korean • Seafood • Stew", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["korean", "seafood", "spicy"] },
  { name: "Jeju Citrus BBQ", image: "🥩", cuisine: "Korean • BBQ • Grill", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$3.19", promo: null, tagSlugs: ["korean", "fast-delivery"] },
  { name: "Bangkok Coconut Curry", image: "🍲", cuisine: "Thai • Curry • Coconut", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["thai", "spicy"] },
  { name: "Chiang Mai Noodle Cart", image: "🍜", cuisine: "Thai • Noodles • Street", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$1.79", promo: null, tagSlugs: ["thai", "under-10"] },
  { name: "Saigon Lemongrass Grill", image: "🍢", cuisine: "Vietnamese • Grill • Fresh", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.09", promo: null, tagSlugs: ["vietnamese", "fast-delivery", "gluten-free"] },
  { name: "Hanoi Pho Simmer", image: "🍜", cuisine: "Vietnamese • Pho • Broth", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["vietnamese", "under-10"] },
  { name: "Cantonese Roast & Rice", image: "🍚", cuisine: "Chinese • Roast • Rice", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["chinese", "fast-delivery"] },
  { name: "Sichuan Pepper House", image: "🥡", cuisine: "Chinese • Sichuan • Heat", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.39", promo: null, tagSlugs: ["chinese", "spicy"] },
  { name: "Athens Souvlaki Stop", image: "🍢", cuisine: "Greek • Souvlaki • Grill", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.69", promo: null, tagSlugs: ["greek", "fast-delivery", "under-10"] },
  { name: "Santorini Salad Bar", image: "🥗", cuisine: "Greek • Salads • Fresh", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$1.79", promo: null, tagSlugs: ["greek", "healthy", "gluten-free"] },
  { name: "Beirut Grill & Garlic", image: "🧄", cuisine: "Lebanese • Grill • Mezze", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.39", promo: null, tagSlugs: ["lebanese", "fast-delivery"] },
  { name: "Cedars & Chickpeas", image: "🧆", cuisine: "Lebanese • Falafel • Vegetarian", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.59", promo: null, tagSlugs: ["lebanese", "vegetarian", "under-10"] },
  { name: "Marrakesh Mint Tagine", image: "🍲", cuisine: "Moroccan • Tagine • Warm", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$3.19", promo: null, tagSlugs: ["moroccan", "spicy", "gluten-free"] },
  { name: "Casablanca Couscous Co.", image: "🍚", cuisine: "Moroccan • Couscous • Comfort", rating: 4.6, deliveryTime: "30-40 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["moroccan", "under-10"] },
  { name: "Tehran Saffron Kebabs", image: "🍢", cuisine: "Persian • Kebabs • Rice", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$3.29", promo: null, tagSlugs: ["persian", "gluten-free"] },
  { name: "Shiraz Herb Rice Bowl", image: "🍚", cuisine: "Persian • Herbs • Rice", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.79", promo: null, tagSlugs: ["persian", "healthy"] },
  { name: "Lima Lomo Saltado", image: "🥩", cuisine: "Peruvian • Stir Fry • Comfort", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["peruvian", "fast-delivery"] },
  { name: "Andes Aji Chicken", image: "🍗", cuisine: "Peruvian • Chicken • Spice", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["peruvian", "spicy"] },
  { name: "Kingston Jerk & Rice", image: "🍗", cuisine: "Caribbean • Jerk • Island", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$2.99", promo: null, tagSlugs: ["caribbean", "spicy"] },
  { name: "Trinidad Doubles Stand", image: "🥙", cuisine: "Caribbean • Street • Vegetarian", rating: 4.5, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["caribbean", "vegetarian", "under-10"] },
  { name: "Bayou Cajun Pot", image: "🍲", cuisine: "Cajun • Gumbo • Comfort", rating: 4.6, deliveryTime: "30-40 min", deliveryFee: "$3.49", promo: null, tagSlugs: ["cajun", "spicy"] },
  { name: "Creole Shrimp & Grits", image: "🦐", cuisine: "Cajun • Seafood • Southern", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$3.59", promo: null, tagSlugs: ["cajun", "seafood", "fast-delivery"] },
  { name: "Jollof Junction", image: "🍚", cuisine: "West African • Jollof • Grill", rating: 4.8, deliveryTime: "30-40 min", deliveryFee: "$3.29", promo: null, tagSlugs: ["west-african", "spicy"] },
  { name: "Suya & Plantain Spot", image: "🍢", cuisine: "West African • Suya • Street", rating: 4.6, deliveryTime: "30-40 min", deliveryFee: "$3.19", promo: null, tagSlugs: ["west-african", "fast-delivery"] },
  { name: "Addis Spice Platter", image: "🥘", cuisine: "Ethiopian • Platter • Stews", rating: 4.8, deliveryTime: "35-45 min", deliveryFee: "$3.79", promo: null, tagSlugs: ["ethiopian", "gluten-free"] },
  { name: "Injera & Lentils", image: "🥘", cuisine: "Ethiopian • Lentils • Vegetarian", rating: 4.6, deliveryTime: "35-45 min", deliveryFee: "$3.49", promo: null, tagSlugs: ["ethiopian", "vegetarian"] },
  { name: "Manila Adobo Market", image: "🍛", cuisine: "Filipino • Adobo • Comfort", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: "$2.49", promo: null, tagSlugs: ["filipino", "fast-delivery"] },
  { name: "Halo-Halo Dessert Bar", image: "🍧", cuisine: "Filipino • Desserts • Sweet", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.59", promo: null, tagSlugs: ["filipino", "desserts", "under-10"] },
  { name: "Rio BBQ Bowl House", image: "🥩", cuisine: "Brazilian • BBQ • Bowls", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$3.19", promo: null, tagSlugs: ["brazilian", "fast-delivery"] },
  { name: "São Paulo Pão & Coffee", image: "☕", cuisine: "Brazilian • Coffee • Bakery", rating: 4.5, deliveryTime: "15-25 min", deliveryFee: "$0.99", promo: "Cafezinho", tagSlugs: ["brazilian", "coffee", "under-10"] },
  { name: "Buenos Aires Empanada Club", image: "🥟", cuisine: "Argentinian • Empanadas • Baked", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.19", promo: null, tagSlugs: ["argentinian", "under-10"] },
  { name: "Patagonia Grill Plates", image: "🥩", cuisine: "Argentinian • Grill • Classic", rating: 4.7, deliveryTime: "30-40 min", deliveryFee: "$3.09", promo: null, tagSlugs: ["argentinian", "fast-delivery", "gluten-free"] },
  { name: "Aegean Mediterranean Kitchen", image: "🥙", cuisine: "Mediterranean • Bowls • Fresh", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["mediterranean", "healthy", "gluten-free"] },
  { name: "Olive & Oregano Wraps", image: "🥙", cuisine: "Mediterranean • Wraps • Quick", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: "$1.59", promo: null, tagSlugs: ["mediterranean", "fast-delivery", "under-10"] },
  { name: "Island Poke & Greens", image: "🐟", cuisine: "Hawaiian • Poke • Fresh", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$2.29", promo: null, tagSlugs: ["hawaiian", "seafood", "healthy"] },
  { name: "Hawaiian Plate Lunch", image: "🍱", cuisine: "Hawaiian • Plate Lunch • Comfort", rating: 4.6, deliveryTime: "25-35 min", deliveryFee: "$2.39", promo: null, tagSlugs: ["hawaiian", "fast-delivery"] },
  { name: "Greenhouse Grain Bowls", image: "🥗", cuisine: "Healthy • Grain Bowls • Fresh", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.89", promo: null, tagSlugs: ["healthy", "gluten-free"] },
  { name: "Vegan Soul Bowls", image: "🥗", cuisine: "Healthy • Vegan • Comfort", rating: 4.7, deliveryTime: "20-30 min", deliveryFee: "$1.99", promo: "Plant Powered", tagSlugs: ["healthy", "vegan", "vegetarian"] },
  { name: "Sunrise Breakfast Sandwiches", image: "🥪", cuisine: "Breakfast • Sandwiches • Coffee", rating: 4.5, deliveryTime: "15-25 min", deliveryFee: "$1.09", promo: null, tagSlugs: ["breakfast", "coffee", "fast-delivery"] },
  { name: "Morning Oats & Fruit", image: "🥣", cuisine: "Breakfast • Oats • Healthy", rating: 4.4, deliveryTime: "15-25 min", deliveryFee: "$0.99", promo: null, tagSlugs: ["breakfast", "healthy", "under-10"] },
  { name: "Neighborhood Coffee & Cardamom", image: "☕", cuisine: "Coffee • Spiced • Bakery", rating: 4.6, deliveryTime: "15-25 min", deliveryFee: "$0.99", promo: null, tagSlugs: ["coffee", "under-10"] },
  { name: "Cold Brew & Cookies", image: "🍪", cuisine: "Coffee • Desserts • Snacks", rating: 4.7, deliveryTime: "15-25 min", deliveryFee: "$0.99", promo: "Cookie Pairing", tagSlugs: ["coffee", "desserts", "under-10"] },
  { name: "Desserts After Dark", image: "🍫", cuisine: "Desserts • Chocolate • Treats", rating: 4.8, deliveryTime: "20-30 min", deliveryFee: "$1.39", promo: null, tagSlugs: ["desserts", "fast-delivery"] },
  { name: "Gluten-Free Cookie Co.", image: "🍪", cuisine: "Desserts • Gluten-Free • Bakery", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: "$1.29", promo: null, tagSlugs: ["desserts", "gluten-free", "under-10"] },
]

await prisma.category.createMany({ data: categories, skipDuplicates: true })

// Tags: cuisines + traits
const cuisineTags = [
  "American",
  "Argentinian",
  "Brazilian",
  "Cajun",
  "Caribbean",
  "Chinese",
  "Ethiopian",
  "Filipino",
  "Fusion",
  "Greek",
  "Hawaiian",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Lebanese",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Moroccan",
  "Persian",
  "Peruvian",
  "Seafood",
  "Thai",
  "Vietnamese",
  "West African",
  "Healthy",
  "Breakfast",
  "Coffee",
  "Desserts",
].map((name) => ({ name, slug: slugify(name), type: "cuisine" }))

const traitTags = [
  { name: "Fast delivery", slug: "fast-delivery" },
  { name: "Under $10", slug: "under-10" },
  { name: "Spicy", slug: "spicy" },
  { name: "Vegan", slug: "vegan" },
  { name: "Vegetarian-friendly", slug: "vegetarian" },
  { name: "Gluten-free options", slug: "gluten-free" },
].map((t) => ({ ...t, type: "trait" }))

await prisma.tag.createMany({
  data: [...cuisineTags, ...traitTags],
  skipDuplicates: true,
})

const totalRestaurants = restaurants.length
for (let i = 0; i < totalRestaurants; i++) {
  const r = restaurants[i]
  const categorySlug = r.categorySlug ?? inferCategorySlug(r)
  const { latitude, longitude, isMehko } = kitchenLatLng(i, totalRestaurants)
  await prisma.restaurant.upsert({
    where: { name: r.name },
    update: {
      name: r.name,
      image: r.image,
      cuisine: r.cuisine,
      rating: r.rating,
      deliveryTime: r.deliveryTime,
      deliveryFee: r.deliveryFee,
      promo: r.promo,
      latitude,
      longitude,
      isMehko,
      isDemo: true,
      ...(categorySlug
        ? {
            category: {
              connect: { slug: categorySlug },
            },
          }
        : {}),
    },
    create: {
      name: r.name,
      image: r.image,
      cuisine: r.cuisine,
      rating: r.rating,
      deliveryTime: r.deliveryTime,
      deliveryFee: r.deliveryFee,
      promo: r.promo,
      latitude,
      longitude,
      isMehko,
      isDemo: true,
      ...(categorySlug
        ? {
            category: {
              connect: { slug: categorySlug },
            },
          }
        : {}),
    },
  })
}

// Connect restaurants ↔ tags
const tagRows = await prisma.tag.findMany({
  select: { id: true, slug: true },
})
const tagIdBySlug = new Map(tagRows.map((t) => [t.slug, t.id]))

const restaurantRows = await prisma.restaurant.findMany({
  select: { id: true, name: true },
})
const restaurantIdByName = new Map(restaurantRows.map((r) => [r.name, r.id]))

const links = []
for (const r of restaurants) {
  const restaurantId = restaurantIdByName.get(r.name)
  if (!restaurantId) continue
  for (const slug of r.tagSlugs ?? []) {
    const tagId = tagIdBySlug.get(slug)
    if (!tagId) continue
    links.push({ restaurantId, tagId })
  }
}

if (links.length) {
  await prisma.restaurantTag.createMany({ data: links, skipDuplicates: true })
}

// Demo user + orders (password: see DEMO_USER_PASSWORD / default demo1234)
const passwordHash = bcrypt.hashSync(demoPassword, 12)
const demoUser = await prisma.user.upsert({
  where: { email: DEMO_EMAIL },
  update: { passwordHash, name: "Demo User" },
  create: { email: DEMO_EMAIL, passwordHash, name: "Demo User" },
})
await prisma.user.update({
  where: { id: demoUser.id },
  data: {
    deliveryLine1: "200 N Spring St",
    deliveryLine2: null,
    deliveryCity: "Los Angeles",
    deliveryState: "CA",
    deliveryPostalCode: "90012",
    deliveryLat: KITCHEN_HUB_LAT,
    deliveryLng: KITCHEN_HUB_LNG,
    kitchenSearchRadiusMiles: 10,
  },
})
await prisma.order.deleteMany({ where: { userId: demoUser.id } })

const seoulKitchen = restaurantIdByName.get("Seoul Street Kitchen")
const now = Date.now()

const demoOrders = [
  {
    userId: demoUser.id,
    status: "delivered",
    restaurantId: seoulKitchen ?? undefined,
    items: {
      restaurant: "Seoul Street Kitchen",
      deliveryWindow: "Delivered Tue, Apr 15 · 6:22 PM",
      lines: [
        { name: "Bibimbap Bowl", qty: 1, price: "$14.99" },
        { name: "Kimchi (side)", qty: 2, price: "$5.00" },
        { name: "Tip", qty: 1, price: "$4.00" },
      ],
      total: "$28.99",
    },
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 5),
  },
  {
    userId: demoUser.id,
    status: "in_transit",
    restaurantId: restaurantIdByName.get("Mediterranean Mezze") ?? undefined,
    items: {
      restaurant: "Mediterranean Mezze",
      deliveryWindow: "Arriving today · 7:10–7:35 PM",
      lines: [
        { name: "Chicken Shawarma Wrap", qty: 2, price: "$23.98" },
        { name: "Greek Salad", qty: 1, price: "$9.50" },
        { name: "Delivery fee", qty: 1, price: "$2.29" },
      ],
      total: "$35.77",
    },
    createdAt: new Date(now - 1000 * 60 * 45),
  },
  {
    userId: demoUser.id,
    status: "preparing",
    restaurantId: restaurantIdByName.get("Bangkok Basil") ?? undefined,
    items: {
      restaurant: "Bangkok Basil",
      deliveryWindow: "Estimated arrival · 8:00–8:25 PM",
      lines: [
        { name: "Green Curry (tofu)", qty: 1, price: "$16.50" },
        { name: "Jasmine Rice", qty: 1, price: "$3.00" },
        { name: "Thai Iced Tea", qty: 1, price: "$4.25" },
      ],
      total: "$23.75",
    },
    createdAt: new Date(now - 1000 * 60 * 12),
  },
  {
    userId: demoUser.id,
    status: "cancelled",
    restaurantId: restaurantIdByName.get("Sweet Treats Bakery") ?? undefined,
    items: {
      restaurant: "Sweet Treats Bakery",
      deliveryWindow: "Cancelled · Apr 10",
      lines: [
        { name: "Assorted Cupcakes (6)", qty: 1, price: "$18.00" },
      ],
      total: "$18.00",
    },
    createdAt: new Date(now - 1000 * 60 * 60 * 24 * 12),
  },
]

for (const o of demoOrders) {
  await prisma.order.create({ data: o })
}

// Demo cook + kitchen assignment + cook-visible orders
const cookPasswordHash = bcrypt.hashSync(demoCookPassword, 12)
const demoCook = await prisma.user.upsert({
  where: { email: DEMO_COOK_EMAIL },
  update: { passwordHash: cookPasswordHash, name: "Demo Cook", role: "COOK" },
  create: {
    email: DEMO_COOK_EMAIL,
    passwordHash: cookPasswordHash,
    name: "Demo Cook",
    role: "COOK",
  },
})

if (seoulKitchen) {
  await prisma.restaurant.updateMany({ where: { ownerId: demoCook.id }, data: { ownerId: null } })
  await prisma.restaurant.update({
    where: { id: seoulKitchen },
    data: { ownerId: demoCook.id },
  })
}

const buyerMaria = await prisma.user.upsert({
  where: { email: "maria@example.com" },
  update: { passwordHash: cookPasswordHash, name: "Maria Lopez" },
  create: {
    email: "maria@example.com",
    passwordHash: cookPasswordHash,
    name: "Maria Lopez",
    role: "MEMBER",
  },
})

const buyerJames = await prisma.user.upsert({
  where: { email: "james@example.com" },
  update: { passwordHash: cookPasswordHash, name: "James Chen" },
  create: {
    email: "james@example.com",
    passwordHash: cookPasswordHash,
    name: "James Chen",
    role: "MEMBER",
  },
})

if (seoulKitchen) {
  await prisma.order.deleteMany({
    where: {
      restaurantId: seoulKitchen,
      userId: { in: [buyerMaria.id, buyerJames.id] },
    },
  })

  const now = Date.now()
  const cookKitchenOrders = [
    {
      userId: buyerMaria.id,
      restaurantId: seoulKitchen,
      status: "delivered",
      items: {
        restaurant: "Seoul Street Kitchen",
        deliveryWindow: "Delivered today · 12:15 PM",
        lines: [
          { name: "Bulgogi Bowl", qty: 2, price: "$27.98" },
          { name: "Miso Soup", qty: 1, price: "$4.50" },
        ],
        total: "$32.48",
      },
      createdAt: new Date(now - 1000 * 60 * 60 * 3),
    },
    {
      userId: buyerJames.id,
      restaurantId: seoulKitchen,
      status: "preparing",
      items: {
        restaurant: "Seoul Street Kitchen",
        deliveryWindow: "Estimated · 7:30 PM",
        lines: [
          { name: "Korean Fried Chicken", qty: 1, price: "$16.99" },
          { name: "Pickled Radish", qty: 1, price: "$3.00" },
        ],
        total: "$19.99",
      },
      createdAt: new Date(now - 1000 * 60 * 20),
    },
  ]

  for (const o of cookKitchenOrders) {
    await prisma.order.create({ data: o })
  }
}

// Local dev: active listing subscription so cook dashboard stats work without Stripe webhook
await prisma.cookSubscription.upsert({
  where: { userId: demoCook.id },
  update: {
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  },
  create: {
    userId: demoCook.id,
    stripeCustomerId: `cus_seed_${demoCook.id}`,
    stripeSubscriptionId: `sub_seed_${demoCook.id}`,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  },
})

console.log(
  "Seeded categories, tags, restaurants, tag links, demo user, demo cook (cook@munch.com), and demo orders.",
)

await prisma.$disconnect()

