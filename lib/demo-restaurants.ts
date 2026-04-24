/** Marketing / homepage restaurant cards — kept in sync with seed names for demo IDs 1–12. */
export type DemoRestaurant = {
  id: number
  name: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: string
  promo?: string | null
}

export const DEMO_RESTAURANTS: DemoRestaurant[] = [
  {
    id: 1,
    name: "Burger Palace",
    image: "🍔",
    cuisine: "American • Burgers • Fast Food",
    rating: 4.8,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.99",
    promo: "20% OFF",
  },
  {
    id: 2,
    name: "Pizza Paradise",
    image: "🍕",
    cuisine: "Italian • Pizza • Pasta",
    rating: 4.6,
    deliveryTime: "20-30 min",
    deliveryFee: "$0.99",
  },
  {
    id: 3,
    name: "Sushi Master",
    image: "🍣",
    cuisine: "Japanese • Sushi • Asian",
    rating: 4.9,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.99",
    promo: "Free Delivery",
  },
  {
    id: 4,
    name: "Taco Fiesta",
    image: "🌮",
    cuisine: "Mexican • Tacos • Burritos",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.49",
  },
  {
    id: 5,
    name: "Noodle House",
    image: "🍜",
    cuisine: "Chinese • Noodles • Asian",
    rating: 4.7,
    deliveryTime: "20-30 min",
    deliveryFee: "$1.99",
    promo: "15% OFF",
  },
  {
    id: 6,
    name: "Curry Kingdom",
    image: "🍛",
    cuisine: "Indian • Curry • Rice",
    rating: 4.8,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.49",
  },
  {
    id: 7,
    name: "Mediterranean Delights",
    image: "🥙",
    cuisine: "Mediterranean • Healthy • Wraps",
    rating: 4.6,
    deliveryTime: "20-30 min",
    deliveryFee: "$1.99",
  },
  {
    id: 8,
    name: "Sweet Treats Bakery",
    image: "🧁",
    cuisine: "Desserts • Bakery • Coffee",
    rating: 4.9,
    deliveryTime: "15-20 min",
    deliveryFee: "$0.99",
    promo: "Buy 1 Get 1",
  },
  {
    id: 9,
    name: "Thai Orchid",
    image: "🍲",
    cuisine: "Thai • Asian • Curry",
    rating: 4.7,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.49",
  },
  {
    id: 10,
    name: "Steakhouse Grill",
    image: "🥩",
    cuisine: "American • Steaks • BBQ",
    rating: 4.8,
    deliveryTime: "30-40 min",
    deliveryFee: "$3.99",
  },
  {
    id: 11,
    name: "Fresh Salads",
    image: "🥗",
    cuisine: "Healthy • Salads • Bowls",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: "$1.49",
  },
  {
    id: 12,
    name: "Seafood Harbor",
    image: "🦐",
    cuisine: "Seafood • Fish • Lobster",
    rating: 4.7,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.99",
    promo: "$5 OFF",
  },
]

export function getDemoRestaurantById(id: number): DemoRestaurant | undefined {
  return DEMO_RESTAURANTS.find((r) => r.id === id)
}
