import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package2, Globe, Zap, Shield, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setLocation(`/track/${trackingNumber.trim()}`);
    }
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
            Global logistics, <br />
            <span className="text-primary">simplified.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            From single packages to full freight loads, ShipFast delivers your cargo with precision, transparency, and speed.
          </p>

          <div className="max-w-xl mx-auto bg-card rounded-2xl shadow-xl p-2 border">
            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..." 
                  className="h-14 pl-12 text-lg border-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 text-lg rounded-xl">
                Track
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global Network</h3>
              <p className="text-muted-foreground">Operating in over 190 countries with dedicated freight routes and local delivery partners.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-muted-foreground">Priority clearing and optimized routing ensures your packages arrive ahead of schedule.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fully Insured</h3>
              <p className="text-muted-foreground">Every shipment is backed by our comprehensive cargo insurance and real-time tracking.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
