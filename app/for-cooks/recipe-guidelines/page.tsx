export default function RecipeGuidelinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Recipe &amp; menu guidelines</h1>
        <p className="mt-2 text-muted-foreground">
          Keep your menu accurate, safe, and welcoming for neighbors ordering from your MEHKO kitchen.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Accurate listings</h2>
          <p className="mt-2">
            List real dishes you can prepare during your permitted operating hours. Include major
            allergens in the description (milk, eggs, fish, shellfish, tree nuts, peanuts, wheat,
            soy, sesame). Update prices when ingredient costs change.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Photos &amp; descriptions</h2>
          <p className="mt-2">
            Use photos of food you actually make. Avoid misleading stock images. Descriptions should
            reflect portion size, spice level, and whether items are vegetarian, vegan, or gluten-free
            only when true.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Food safety</h2>
          <p className="mt-2">
            Follow your county MEHKO rules for labeling, storage, and handoff. Pack hot food hot and
            cold food cold. If you cannot fulfill an order safely, cancel promptly so the customer
            receives a refund.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Availability</h2>
          <p className="mt-2">
            Toggle menu items off when you run out. Pause your kitchen listing if you are traveling or
            between permit renewals. Customers trust cooks who communicate clearly.
          </p>
        </section>
      </div>
    </div>
  )
}
