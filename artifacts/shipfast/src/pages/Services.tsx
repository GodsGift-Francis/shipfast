import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Truck, Zap, Package, Globe, Ship, Check, ArrowRight } from "lucide-react";

const services = [
  { code: "S-01", title: "Standard Ground", icon: Truck, description: "Reliable, cost-effective delivery for routine continental shipments.", features: ["3-5 business days", "Full tracking included", "Carbon-neutral options", "Best for bulk items"], price: "from $8.99" },
  { code: "S-02", title: "Express Priority", icon: Zap, description: "Fast delivery for time-sensitive packages that can't wait.", features: ["1-2 business days", "Priority handling", "Delivery confirmation", "Insurance up to $500"], price: "from $14.99" },
  { code: "S-03", title: "Overnight", icon: Package, description: "Guaranteed next-morning delivery for your most critical shipments.", features: ["Next morning by 10 AM", "Signature required", "Premium support", "Full insurance coverage"], price: "from $29.99" },
  { code: "S-04", title: "Global International", icon: Globe, description: "Cross-border shipping with automated customs clearance.", features: ["190+ countries", "Customs handling", "Duties & taxes managed", "Global tracking"], price: "custom quote" },
  { code: "S-05", title: "Freight & Cargo", icon: Ship, description: "LTL and FTL shipping for oversized items and commercial pallets.", features: ["Palletized cargo", "Dedicated accounts", "Warehouse to warehouse", "Liftgate services"], price: "custom quote" },
];

export default function Services() {
  return (
    <PublicLayout>
      {/* Header band */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="waybill-grid absolute inset-0 opacity-0" aria-hidden />
        <div className="container mx-auto px-4 py-16 md:py-20">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Service catalogue</p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Logistics solutions for every scale
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/70">
            From a single document across town to a container across the globe, there's a tier built for the job.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s.code} className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/8 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground">{s.code}</span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-bold">{s.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-[hsl(var(--chart-3))]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                  <span className="font-mono text-sm font-bold tracking-wide">{s.price}</span>
                  <Button variant="ghost" size="sm" asChild className="text-foreground">
                    <Link href="/quote">Get a quote <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </div>
            ))}

            {/* Enterprise card */}
            <div className="flex flex-col justify-between rounded-xl border border-accent/30 bg-accent/10 p-6">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[hsl(38_82%_38%)]">Enterprise</span>
                <h2 className="mt-4 font-display text-2xl font-bold">Need volume pricing?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Dedicated account management, API integration, and discounts for high-volume shippers.
                </p>
              </div>
              <Button size="lg" className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/quote">Contact sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
