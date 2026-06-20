import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListShipments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Plus, Search, Filter, Package, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { statusBadgeClass, statusLabel } from "@/lib/status";
import { format } from "date-fns";

export default function Shipments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListShipments({
    search: search || undefined,
    status: status !== "all" ? (status as any) : undefined,
    page,
    limit: 10
  });

  const getStatusColor = (status: string) => statusBadgeClass(status);

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
            <p className="text-muted-foreground">Manage and track active shipments.</p>
          </div>
          <Button asChild>
            <Link href="/shipments/new">
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tracking number, customer..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : data && data.shipments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Tracking Number</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Service</th>
                      <th className="px-6 py-4 font-medium">Origin</th>
                      <th className="px-6 py-4 font-medium">Destination</th>
                      <th className="px-6 py-4 font-medium">Est. Delivery</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.shipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`border ${getStatusColor(shipment.status)}`}>
                            {statusLabel(shipment.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 capitalize">{shipment.serviceType}</td>
                        <td className="px-6 py-4">{shipment.originCity}, {shipment.originCountry}</td>
                        <td className="px-6 py-4">{shipment.destinationCity}, {shipment.destinationCountry}</td>
                        <td className="px-6 py-4">{format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/shipments/${shipment.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="w-12 h-12 mb-4 opacity-20" />
                <p>No shipments found</p>
              </div>
            )}
            
            {data && data.total > data.limit && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * data.limit) + 1} to {Math.min(page * data.limit, data.total)} of {data.total}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page * data.limit >= data.total}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
