import { DeliveryAddressForm } from "@/components/delivery-address-form"

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Delivery address</h1>
        <p className="mt-2 text-muted-foreground">
          Save where you want meals delivered. We&apos;ll show MEHKO kitchens near you sorted by distance.
        </p>
        <div className="mt-8">
          <DeliveryAddressForm />
        </div>
      </main>
    </div>
  )
}
