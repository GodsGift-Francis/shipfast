import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Package, Truck, Zap, Globe, Ship } from "lucide-react";

export default function Services() {
  const services = [
    {
      id: "standard",
      title: "Standard Ground",
      description: "Reliable and cost-effective shipping for routine deliveries within the continent.",
      icon: Truck,
      features: ["3-5 business days", "Full tracking included", "Carbon neutral options", "Best for bulk items"],
      price: "Starts at $8.99"
    },
    {
      id: "express",
      title: "Express Priority",
      description: "Fast delivery for time-sensitive packages that need to arrive quickly.",
      icon: Zap,
      features: ["1-2 business days", "Priority handling", "Delivery confirmation", "Insurance up to $500"],
      price: "Starts at $14.99"
    },
    {
      id: "overnight",
      title: "Overnight Delivery",
      description: "Guaranteed next-morning delivery for your most critical shipments.",
      icon: Package,
      features: ["Next morning by 10 AM", "Signature required", "Premium support", "Full insurance coverage"],
      price: "Starts at $29.99"
    },
    {
      id: "international",
      title: "Global International",
      description: "Seamless cross-border shipping with automated customs clearance.",
      icon: Globe,
      features: ["190+ countries", "Customs handling", "Duties & taxes managed", "Global tracking"],
      price: "Custom quote"
    },
    {
      id: "freight",
      title: "Freight & Cargo",
      description: "LTL and FTL shipping for oversized items and commercial pallets.",
      icon: Ship,
      features: ["Palletized cargo", "Dedicated accounts", "Warehouse to warehouse", "Liftgate services"],
      price: "Custom quote"
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-background pt-16 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Logistics solutions for every scale</h1>
            <p className="text-xl text-muted-foreground">
              Whether you're sending a single document across town or a container across the globe, we have a service designed for your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="flex flex-col hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-6 border-t flex items-center justify-between mt-auto">
                      <span className="font-semibold">{service.price}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/quote">Get Quote</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-24 bg-primary/5 rounded-3xl p-12 text-center max-w-4xl mx-auto border border-primary/10">
            <h2 className="text-3xl font-bold mb-4">Need an enterprise solution?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We offer dedicated account management, API integration, and volume discounts for high-volume shippers.
            </p>
            <Button size="lg" asChild>
              <Link href="/quote">Contact Enterprise Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
