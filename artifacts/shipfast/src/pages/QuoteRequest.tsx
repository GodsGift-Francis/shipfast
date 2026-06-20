import { PublicLayout } from "@/components/layout/PublicLayout";
import { useCreateQuote } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calculator, CheckCircle2, Package, ArrowRight } from "lucide-react";
import { useState } from "react";
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
        toast({
          title: "Quote Requested",
          description: "Your quote has been calculated successfully.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate quote. Please check your inputs.",
          variant: "destructive",
        });
      }
    });
  };

  if (estimatedCost !== null) {
    return (
      <PublicLayout>
        <div className="bg-muted/30 pt-16 pb-24 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl">Quote Generated</CardTitle>
              <CardDescription>Based on your requirements, here is your estimated cost.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 rounded-xl p-8">
                <p className="text-sm font-medium text-primary mb-2">Estimated Total</p>
                <p className="text-5xl font-bold">${estimatedCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">USD</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Our sales team will contact you shortly to finalize the booking and arrange pickup.
              </p>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setEstimatedCost(null)}>
                  New Quote
                </Button>
                <Button className="flex-1" asChild>
                  <a href="/">Return Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-muted/30 pt-16 pb-24 min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Request a Quote</h1>
            <p className="text-muted-foreground text-lg">Instantly estimate shipping costs for your cargo.</p>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2 text-muted-foreground"><Package className="w-4 h-4" /> Package Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Level</Label>
                      <Select name="serviceType" defaultValue="standard" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
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
                      <Input type="number" id="weight" name="weight" min="0.1" step="0.1" required placeholder="e.g. 5" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dimensions">Dimensions (LxWxH cm) - Optional</Label>
                      <Input id="dimensions" name="dimensions" placeholder="e.g. 50x40x30" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-muted-foreground border-t pt-6">Route</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="originCity">Origin City</Label>
                        <Input id="originCity" name="originCity" required placeholder="e.g. New York" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originCountry">Origin Country</Label>
                        <Input id="originCountry" name="originCountry" required placeholder="e.g. USA" />
                      </div>
                    </div>
                    <div className="space-y-4 relative">
                      <div className="hidden md:flex absolute top-1/2 -left-6 -translate-y-1/2 w-4 h-4 text-muted-foreground items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destinationCity">Destination City</Label>
                        <Input id="destinationCity" name="destinationCity" required placeholder="e.g. London" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="destinationCountry">Destination Country</Label>
                        <Input id="destinationCountry" name="destinationCountry" required placeholder="e.g. UK" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-medium text-muted-foreground">Contact Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Full Name</Label>
                      <Input id="contactName" name="contactName" required placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address</Label>
                      <Input type="email" id="contactEmail" name="contactEmail" required placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input id="contactPhone" name="contactPhone" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Special Instructions</Label>
                      <Textarea id="notes" name="notes" placeholder="Any special handling requirements?" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" className="w-full md:w-auto min-w-[200px]" disabled={createQuote.isPending}>
                    {createQuote.isPending ? "Calculating..." : "Get Estimate"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
