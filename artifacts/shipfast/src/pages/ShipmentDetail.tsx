import { PortalLayout } from "@/components/layout/PortalLayout";
import { 
  useGetShipment, getGetShipmentQueryKey,
  useUpdateShipment,
  useCancelShipment,
  useAddTrackingEvent,
  useListTrackingEvents, getListTrackingEventsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusBadgeClass, statusLabel } from "@/lib/status";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Package, MapPin, User, FileText, Calendar, Plus, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { ShipmentUpdateStatus } from "@workspace/api-client-react";

export default function ShipmentDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipmentDetail, isLoading, isError } = useGetShipment(id, {
    query: {
      enabled: !!id,
      queryKey: getGetShipmentQueryKey(id)
    }
  });

  const { data: events, isLoading: eventsLoading } = useListTrackingEvents(id, {
    query: {
      enabled: !!id,
      queryKey: getListTrackingEventsQueryKey(id)
    }
  });

  const updateShipment = useUpdateShipment();
  const cancelShipment = useCancelShipment();
  const addEvent = useAddTrackingEvent();

  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const getStatusColor = (status: string) => statusBadgeClass(status);

  const handleUpdateStatus = (status: string) => {
    updateShipment.mutate({ id, data: { status: status as ShipmentUpdateStatus } }, {
      onSuccess: () => {
        toast({ title: "Status Updated", description: "Shipment status has been updated." });
        queryClient.invalidateQueries({ queryKey: getGetShipmentQueryKey(id) });
      }
    });
  };

  const handleCancel = () => {
    if(confirm("Are you sure you want to cancel this shipment?")) {
      cancelShipment.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Shipment Cancelled", description: "The shipment has been cancelled." });
          queryClient.invalidateQueries({ queryKey: getGetShipmentQueryKey(id) });
        }
      });
    }
  };

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      status: formData.get("status") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
    };

    addEvent.mutate({ id, data }, {
      onSuccess: () => {
        toast({ title: "Event Added", description: "Tracking event recorded successfully." });
        queryClient.invalidateQueries({ queryKey: getListTrackingEventsQueryKey(id) });
        setIsAddingEvent(false);
      }
    });
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

  if (isError || !shipmentDetail) {
    return (
      <PortalLayout>
        <div className="flex flex-col justify-center items-center h-64 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-4 text-destructive opacity-50" />
          <p className="text-lg">Shipment not found.</p>
          <Button variant="link" onClick={() => setLocation("/shipments")}>Back to shipments</Button>
        </div>
      </PortalLayout>
    );
  }

  const shipment = shipmentDetail;

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Shipment {shipment.trackingNumber}</h1>
              <Badge variant="outline" className={`border ${getStatusColor(shipment.status)}`}>
                {statusLabel(shipment.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">Created on {format(new Date(shipment.createdAt), 'MMMM dd, yyyy')}</p>
          </div>
          <div className="flex gap-2">
            <Select value={shipment.status} onValueChange={handleUpdateStatus} disabled={updateShipment.isPending || shipment.status === 'cancelled' || shipment.status === 'delivered'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            {shipment.status !== 'cancelled' && shipment.status !== 'delivered' && (
              <Button variant="destructive" onClick={handleCancel} disabled={cancelShipment.isPending}>
                Cancel Shipment
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Sender Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{shipment.senderName}</p>
                  <p className="text-sm text-muted-foreground">{shipment.senderEmail}</p>
                  <p className="text-sm text-muted-foreground mb-4">{shipment.senderPhone}</p>
                  <p className="text-sm font-medium">Origin Address</p>
                  <p className="text-sm text-muted-foreground">{shipment.originAddress}</p>
                  <p className="text-sm text-muted-foreground">{shipment.originCity}, {shipment.originCountry}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Recipient Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{shipment.recipientName}</p>
                  <p className="text-sm text-muted-foreground">{shipment.recipientEmail}</p>
                  <p className="text-sm text-muted-foreground mb-4">{shipment.recipientPhone}</p>
                  <p className="text-sm font-medium">Destination Address</p>
                  <p className="text-sm text-muted-foreground">{shipment.destinationAddress}</p>
                  <p className="text-sm text-muted-foreground">{shipment.destinationCity}, {shipment.destinationCountry}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Tracking Timeline
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsAddingEvent(!isAddingEvent)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                {isAddingEvent && (
                  <form onSubmit={handleAddEvent} className="bg-muted/30 p-4 rounded-xl mb-6 space-y-4 border border-border">
                    <h4 className="font-medium text-sm">New Tracking Event</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Status</label>
                        <Input name="status" placeholder="e.g. Arrived at Facility" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Location</label>
                        <Input name="location" placeholder="e.g. Memphis, TN" required />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-xs font-medium">Description</label>
                        <Input name="description" placeholder="Additional details..." required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingEvent(false)}>Cancel</Button>
                      <Button type="submit" size="sm" disabled={addEvent.isPending}>Save Event</Button>
                    </div>
                  </form>
                )}

                {eventsLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-6 ml-2 border-l-2 border-muted pl-6 pt-2 pb-2">
                    {events.map((event) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                          <div>
                            <p className="font-medium">{event.status}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <p className="text-xs font-medium mt-1 flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                            <p>{format(new Date(event.timestamp), 'MMM dd, yyyy')}</p>
                            <p>{format(new Date(event.timestamp), 'hh:mm a')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No tracking events recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Cargo Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Service Level</span>
                  <span className="text-sm font-medium capitalize">{shipment.serviceType}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <span className="text-sm font-medium">{shipment.weight} kg</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Dimensions</span>
                  <span className="text-sm font-medium">{shipment.dimensions || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Declared Value</span>
                  <span className="text-sm font-medium">{shipment.declaredValue ? `$${shipment.declaredValue}` : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Est. Delivery</span>
                  <span className="text-sm font-medium">{format(new Date(shipment.estimatedDelivery), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-medium text-foreground">Shipping Cost</span>
                  <span className="font-bold text-primary">${shipment.shippingCost?.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            
            {shipment.notes && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border">
                    {shipment.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
