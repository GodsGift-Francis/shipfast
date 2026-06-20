import { PortalLayout } from "@/components/layout/PortalLayout";
import { useCreateShipment, getListShipmentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, User, MapPin } from "lucide-react";
import type { ShipmentInputServiceType } from "@workspace/api-client-react";

export default function ShipmentNew() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createShipment = useCreateShipment();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      serviceType: formData.get("serviceType") as ShipmentInputServiceType,
      originAddress: formData.get("originAddress") as string,
      originCity: formData.get("originCity") as string,
      originCountry: formData.get("originCountry") as string,
      destinationAddress: formData.get("destinationAddress") as string,
      destinationCity: formData.get("destinationCity") as string,
      destinationCountry: formData.get("destinationCountry") as string,
      senderName: formData.get("senderName") as string,
      senderEmail: formData.get("senderEmail") as string,
      senderPhone: formData.get("senderPhone") as string,
      recipientName: formData.get("recipientName") as string,
      recipientEmail: formData.get("recipientEmail") as string,
      recipientPhone: formData.get("recipientPhone") as string,
      weight: Number(formData.get("weight")),
      dimensions: formData.get("dimensions") as string,
      declaredValue: formData.get("declaredValue") ? Number(formData.get("declaredValue")) : undefined,
      notes: formData.get("notes") as string,
    };

    createShipment.mutate({ data }, {
      onSuccess: (res) => {
        toast({ title: "Shipment Created", description: `Tracking number: ${res.trackingNumber}` });
        queryClient.invalidateQueries({ queryKey: getListShipmentsQueryKey() });
        setLocation(`/shipments/${res.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create shipment.", variant: "destructive" });
      }
    });
  };

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Shipment</h1>
          <p className="text-muted-foreground">Create a new shipping order.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
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
                <Input type="number" id="weight" name="weight" min="0.1" step="0.1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (LxWxH cm)</Label>
                <Input id="dimensions" name="dimensions" placeholder="e.g. 50x40x30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="declaredValue">Declared Value ($)</Label>
                <Input type="number" id="declaredValue" name="declaredValue" min="0" step="0.01" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes/Instructions</Label>
                <Textarea id="notes" name="notes" placeholder="Special handling required?" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Sender Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Name / Company</Label>
                  <Input id="senderName" name="senderName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Email</Label>
                  <Input type="email" id="senderEmail" name="senderEmail" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">Phone</Label>
                  <Input id="senderPhone" name="senderPhone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originAddress">Address</Label>
                  <Input id="originAddress" name="originAddress" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originCity">City</Label>
                    <Input id="originCity" name="originCity" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originCountry">Country</Label>
                    <Input id="originCountry" name="originCountry" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Recipient Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Name / Company</Label>
                  <Input id="recipientName" name="recipientName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Email</Label>
                  <Input type="email" id="recipientEmail" name="recipientEmail" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Phone</Label>
                  <Input id="recipientPhone" name="recipientPhone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationAddress">Address</Label>
                  <Input id="destinationAddress" name="destinationAddress" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="destinationCity">City</Label>
                    <Input id="destinationCity" name="destinationCity" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationCountry">Country</Label>
                    <Input id="destinationCountry" name="destinationCountry" required />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => setLocation("/shipments")}>Cancel</Button>
            <Button type="submit" disabled={createShipment.isPending}>
              {createShipment.isPending ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
