import { PortalLayout } from "@/components/layout/PortalLayout";
import { 
  useGetCustomer, getGetCustomerQueryKey,
  useUpdateCustomer,
  useListShipments
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { User, Building, Mail, Phone, MapPin, Package, Loader2, ArrowRight } from "lucide-react";
import { CustomerUpdateTier, getListShipmentsQueryKey } from "@workspace/api-client-react";

export default function CustomerDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customer, isLoading, isError } = useGetCustomer(id, {
    query: {
      enabled: !!id,
      queryKey: getGetCustomerQueryKey(id)
    }
  });

  const { data: shipmentsData, isLoading: shipmentsLoading } = useListShipments({ customerId: id }, {
    query: {
      enabled: !!id,
      queryKey: getListShipmentsQueryKey({ customerId: id })
    }
  });

  const updateCustomer = useUpdateCustomer();

  const handleUpdateTier = (tier: string) => {
    updateCustomer.mutate({ id, data: { tier: tier as CustomerUpdateTier } }, {
      onSuccess: () => {
        toast({ title: "Tier Updated", description: "Customer tier has been updated." });
        queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) });
      }
    });
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'enterprise': return "bg-purple-100 text-purple-800 border-0 dark:bg-purple-900 dark:text-purple-300";
      case 'premium': return "bg-blue-100 text-blue-800 border-0 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 border-0 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PortalLayout>
    );
  }

  if (isError || !customer) {
    return (
      <PortalLayout>
        <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
          <User className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg">Customer not found.</p>
          <Button variant="link" onClick={() => setLocation("/customers")}>Back to customers</Button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
              <Badge variant="outline" className={`capitalize ${getTierColor(customer.tier || 'standard')}`}>
                {customer.tier || 'Standard'}
              </Badge>
            </div>
            {customer.company && <p className="text-muted-foreground flex items-center gap-2"><Building className="w-4 h-4" /> {customer.company}</p>}
          </div>
          <div className="flex gap-2">
            <Select value={customer.tier || 'standard'} onValueChange={handleUpdateTier} disabled={updateCustomer.isPending}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link href={`/shipments/new?customerId=${customer.id}`}>Book Shipment</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                {customer.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {(customer.address || customer.city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{customer.address}</p>
                      <p className="text-sm text-muted-foreground">{customer.city}, {customer.country}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Total Shipments</span>
                  <span className="font-medium">{customer.totalShipments || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Total Spend</span>
                  <span className="font-bold text-primary">${(customer.totalSpend || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Recent Shipments
                </CardTitle>
                {shipmentsData && shipmentsData.total > 5 && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/shipments?customerId=${customer.id}`}>View All</Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {shipmentsLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : shipmentsData && shipmentsData.shipments.length > 0 ? (
                  <div className="divide-y">
                    {shipmentsData.shipments.slice(0, 5).map((shipment) => (
                      <div key={shipment.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{shipment.trackingNumber}</span>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {shipment.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{shipment.originCity}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{shipment.destinationCity}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/shipments/${shipment.id}`}>Details</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-48 text-muted-foreground">
                    <Package className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No shipments found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
