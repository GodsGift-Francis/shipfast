import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListShipments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Plus, Search, Filter, Package, ArrowRight, 
  ChevronLeft, ChevronRight, MoreHorizontal, Eye
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function Shipments() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useListShipments({
    search: search || undefined,
    status: status !== "all" ? (status as any) : undefined,
    page,
    limit
  });

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'delivered': return { color: "bg-green-500", label: "Delivered", variant: "default" as const };
      case 'in_transit': return { color: "bg-blue-500", label: "In Transit", variant: "secondary" as const };
      case 'pending': return { color: "bg-amber-500", label: "Pending", variant: "outline" as const };
      case 'cancelled': return { color: "bg-red-500", label: "Cancelled", variant: "destructive" as const };
      default: return { color: "bg-slate-500", label: status, variant: "outline" as const };
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shipments</h1>
            <p className="text-slate-500">Track and manage your global logistics pipeline.</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/shipments/new">
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Link>
          </Button>
        </div>

        {/* Stats Summary Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-600 border-slate-200">
            Total: {data?.total || 0} Shipments
          </Badge>
          {status !== "all" && (
            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
              Filter: {status.replace(/_/g, ' ')}
            </Badge>
          )}
          {search && (
            <Badge variant="outline" className="px-3 py-1 border-accent/20 bg-accent/5 text-accent">
              Search: "{search}"
            </Badge>
          )}
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search tracking number, city, or customer..." 
                  className="pl-9 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full md:w-48 bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Statuses" />
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Tracking #</TableHead>
                    <TableHead className="font-bold text-slate-700">Route</TableHead>
                    <TableHead className="font-bold text-slate-700">Service</TableHead>
                    <TableHead className="font-bold text-slate-700">Weight</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Est. Delivery</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : data && data.shipments.length > 0 ? (
                    data.shipments.map((shipment) => {
                      const config = getStatusConfig(shipment.status);
                      return (
                        <TableRow key={shipment.id} className="group hover:bg-slate-50/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Package className="w-4 h-4" />
                              </div>
                              <span className="font-mono text-xs">{shipment.trackingNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-slate-900">{shipment.originCity}</span>
                              <ArrowRight className="w-3 h-3 text-slate-300" />
                              <span className="font-semibold text-slate-900">{shipment.destinationCity}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
                              {shipment.originCountry} → {shipment.destinationCountry}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-[10px] font-bold py-0 h-5 border-slate-200">
                              {shipment.serviceType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">
                            {shipment.weight} <span className="text-[10px]">kg</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${config.color}`} />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{config.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium">
                            {format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary">
                              <Link href={`/shipments/${shipment.id}`}>
                                <Eye className="w-4 h-4 mr-1.5" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-72 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-200" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">No shipments found</p>
                            <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href="/shipments/new">Book your first shipment</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {data && data.total > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/30">
                <div className="text-xs font-medium text-slate-500">
                  Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{Math.ceil(data.total / data.limit)}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page * limit >= data.total}
                    onClick={() => setPage(p => p + 1)}
                    className="h-8 px-3"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
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
