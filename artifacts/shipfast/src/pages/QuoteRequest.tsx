import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCreateQuote } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { QuoteInputServiceType } from "@workspace/api-client-react";

export default function QuoteRequest() {
  const { toast } = useToast();
  const createQuote = useCreateQuote();
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      serviceType: formData.get("serviceType") as QuoteInputServiceType,
      originCity: formData.get("originCity") as string,
      originCountry: formData.get("originCountry") as string,
      destinationCity: formData.get("destinationCity") as string,
      destinationCountry: formData.get("destinationCountry") as string,
      weight: Number(formData.get("weight")),
      dimensions: formData.get("dimensions") as string,
      contactName: formData.get("contactName") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactPhone: formData.get("contactPhone") as string,
      notes: formData.get("notes") as string,
    };

    createQuote.mutate({ data }, {
      onSuccess: (res) => {
        setEstimatedCost(res.estimatedCost);
        toast({ title: "Quote ready", description: "Your estimate has been calculated." });
      },
      onError: () => {
        toast({ title: "Couldn't generate a quote", description: "Check your inputs and try again.", variant: "destructive" });
      },
    });
  };

  if (estimatedCost !== null) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-secondary/30 px-4 py-16">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-dashed border-border px-6 py-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estimate · ShipFast</span>
            </div>
            <div className="p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--chart-3)/0.12)] text-[hsl(var(--chart-3))]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="mt-5 font-display text-2xl font-extrabold">Quote ready</h1>
              <p className="mt-1 text-sm text-muted-foreground">Based on the details you entered.</p>
              <div className="mt-6 rounded-xl bg-primary px-6 py-8 text-primary-foreground">
                <p className="font-mono text-[11px] uppercase tracking-wider text-accent">Estimated total</p>
                <p className="mt-2 font-display text-5xl font-extrabold tracking-tight">${estimatedCost.toFixed(2)}</p>
                <p className="mt-1 font-mono text-xs text-primary-foreground/60">USD</p>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">Our team will reach out to finalise booking and arrange pickup.</p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setEstimatedCost(null)}>New quote</Button>
                <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                  <Link href="/">Done</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Instant estimate</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Request a quote</h1>
          <p className="mt-3 max-w-xl text-primary-foreground/70">Tell us what's moving and where. You'll get a price in seconds.</p>
        </div>
      </section>

      <div className="bg-secondary/30 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-8">
              <fieldset className="space-y-4">
                <legend className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent">Package</legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service level</Label>
                    <Select name="serviceType" defaultValue="standard" required>
                      <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="freight">Freight</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input type="number" id="weight" name="weight" min="0.1" step="0.1" required placeholder="5" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dimensions">Dimensions (L×W×H cm) — optional</Label>
                    <Input id="dimensions" name="dimensions" placeholder="50×40×30" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-border pt-6">
                <legend className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent">Route</legend>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="originCity">Origin city</Label>
                      <Input id="originCity" name="originCity" required placeholder="Accra" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originCountry">Origin country</Label>
                      <Input id="originCountry" name="originCountry" required placeholder="Ghana" />
                    </div>
                  </div>
                  <div className="relative space-y-4">
                    <div className="absolute -left-3 top-1/2 hidden -translate-y-1/2 text-muted-foreground md:block">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationCity">Destination city</Label>
                      <Input id="destinationCity" name="destinationCity" required placeholder="London" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinationCountry">Destination country</Label>
                      <Input id="destinationCountry" name="destinationCountry" required placeholder="UK" />
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-border pt-6">
                <legend className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent">Contact</legend>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Full name</Label>
                    <Input id="contactName" name="contactName" required placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input type="email" id="contactEmail" name="contactEmail" required placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input id="contactPhone" name="contactPhone" placeholder="+233 20 000 0000" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Special instructions</Label>
                    <Textarea id="notes" name="notes" placeholder="Any special handling requirements?" />
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end border-t border-border pt-6">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 md:w-auto md:min-w-[220px]" disabled={createQuote.isPending}>
                  {createQuote.isPending ? "Calculating…" : "Get estimate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
