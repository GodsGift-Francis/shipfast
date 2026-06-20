import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Plane, Ship, Globe2, Warehouse, ArrowRight, Bell } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const STATS = [
  { value: "190+", label: "Countries served" },
  { value: "4.2M", label: "Parcels delivered" },
  { value: "99.2%", label: "On-time rate" },
  { value: "24/7", label: "Live tracking" },
];

const PIPELINE = [
  { key: "pending", label: "Booked" },
  { key: "processing", label: "Processing" },
  { key: "in_transit", label: "In transit" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const SERVICES = [
  { code: "S-01", name: "Express", icon: Plane, desc: "Overnight and 2-day priority for time-critical parcels." },
  { code: "S-02", name: "Freight", icon: Ship, desc: "Sea and road freight for pallets and full container loads." },
  { code: "S-03", name: "International", icon: Globe2, desc: "Customs-cleared cross-border delivery to 190+ countries." },
  { code: "S-04", name: "Warehousing", icon: Warehouse, desc: "Storage, pick-and-pack, and fulfilment from our hubs." },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) setLocation(`/track/${trackingNumber.trim()}`);
  };

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="waybill-grid absolute inset-0 opacity-60" aria-hidden />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden />
        <div className="container relative mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Global freight &amp; parcel
            </p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
              Know where<br />it is.{" "}
              <span className="text-accent">Every mile.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-primary-foreground/70">
              Track parcels and freight in real time, get instant quotes, and ship worldwide — with a status alert at every step.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/quote">Get a quote <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/services">Explore services</Link>
              </Button>
            </div>
          </div>

          {/* Waybill track panel — the signature element */}
          <div className="rounded-2xl bg-card p-1.5 text-card-foreground shadow-2xl shadow-black/30 ring-1 ring-black/5">
            <div className="rounded-[12px] border border-border bg-background">
              <div className="flex items-center justify-between border-b border-dashed border-border px-5 py-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Air Waybill · Track
                </span>
                <span className="font-mono text-[11px] font-bold tracking-wider text-accent">SHF</span>
              </div>
              <form onSubmit={handleTrack} className="p-5">
                <label htmlFor="track" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Tracking number
                </label>
                <input
                  id="track"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="SHF-K8F2-2210"
                  data-testid="input-tracking"
                  className="mt-2 w-full rounded-lg border border-input bg-secondary/40 px-4 py-3 font-mono text-lg tracking-wide outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
                />
                <Button type="submit" size="lg" className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-track-submit">
                  Track package
                </Button>

                {/* Route line motif */}
                <div className="mt-6">
                  <svg viewBox="0 0 320 26" className="w-full" role="img" aria-label="Origin to destination route">
                    <line x1="14" y1="13" x2="306" y2="13" stroke="hsl(var(--border))" strokeWidth="2" />
                    <line
                      x1="14" y1="13" x2="306" y2="13"
                      stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="6 8"
                      className="[animation:route-dash_1.1s_linear_infinite] motion-reduce:[animation:none]"
                    />
                    <circle cx="14" cy="13" r="5" fill="hsl(var(--primary))" />
                    <circle cx="306" cy="13" r="5" fill="hsl(var(--accent))"
                      className="[animation:transit-pulse_1.8s_ease-in-out_infinite] motion-reduce:[animation:none]" />
                  </svg>
                  <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>Origin</span>
                    <span>Destination</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto grid grid-cols-2 divide-border px-4 md:grid-cols-4 md:divide-x">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 py-8 text-center md:px-6">
              <div className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{s.value}</div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATUS PIPELINE — encodes the real shipment lifecycle */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <Bell className="mr-1.5 inline h-3.5 w-3.5" /> Status alerts
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              An update the moment your package moves
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every shipment moves through five stages. We email and text both sender and recipient automatically the instant the status changes — no refreshing required.
            </p>
          </div>

          <ol className="relative grid gap-8 sm:grid-cols-5">
            <div className="absolute left-0 right-0 top-4 hidden h-px bg-border sm:block" aria-hidden />
            {PIPELINE.map((step, i) => (
              <li key={step.key} className="relative">
                <div className="flex items-center gap-3 sm:block">
                  <span
                    className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${
                      i === PIPELINE.length - 1
                        ? "bg-accent text-accent-foreground"
                        : "border border-border bg-card text-foreground"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="sm:mt-4">
                    <div className="font-semibold">{step.label}</div>
                    <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {step.key.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SERVICES TEASER */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">What we move</p>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight md:text-4xl">Built for every load</h2>
            </div>
            <Link href="/services" className="group inline-flex items-center gap-1 text-sm font-medium text-foreground">
              All services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.code} className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <s.icon className="h-7 w-7 text-primary" />
                  <span className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground">{s.code}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent text-accent-foreground">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-14 text-center md:flex-row md:text-left">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Ready to ship?</h2>
            <p className="mt-1 text-accent-foreground/80">Get a quote in under a minute. No account required.</p>
          </div>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/quote">Get a quote <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
