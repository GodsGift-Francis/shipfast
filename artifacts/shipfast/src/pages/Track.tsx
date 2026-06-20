import { PublicLayout } from "@/components/layout/PublicLayout";
import { useTrackPackage, getTrackPackageQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, MapPin, CheckCircle2, Clock, Map, Calendar, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";

export default function Track() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const trackingNumberFromUrl = params.trackingNumber || "";
  
  const [trackingNumber, setTrackingNumber] = useState(trackingNumberFromUrl);

  const { data, isLoading, isError } = useTrackPackage(trackingNumberFromUrl, {
    query: {
      enabled: !!trackingNumberFromUrl,
      queryKey: getTrackPackageQueryKey(trackingNumberFromUrl)
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setLocation(`/track/${trackingNumber.trim()}`);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    if (status === 'cancelled' || status === 'on_hold') return <AlertTriangle className="w-6 h-6 text-red-500" />;
    return <Clock className="w-6 h-6 text-blue-500" />;
  };

  const STEPS = ['pending', 'processing', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStepIndex = data ? STEPS.indexOf(data.shipment.status) : -1;

  return (
    <PublicLayout>
      <div className="bg-muted/30 pt-16 pb-24 min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Track Your Shipment</h1>
            <p className="text-muted-foreground text-lg">Enter your tracking number to get real-time updates.</p>
          </div>

          <Card className="mb-8 border-primary/20 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. SF-123456789" 
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8">Track Package</Button>
              </form>
            </CardContent>
          </Card>

          {trackingNumberFromUrl && isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Package className="w-12 h-12 animate-pulse mb-4 opacity-50" />
              <p className="text-lg">Locating your package...</p>
            </div>
          )}

          {trackingNumberFromUrl && isError && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mb-4 text-destructive opacity-50" />
              <p className="text-lg text-destructive">Tracking number not found or invalid.</p>
              <p className="text-sm">Please check the number and try again.</p>
            </div>
          )}

          {data && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader className="bg-muted/30 border-b pb-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2 mb-2">
                        <Package className="w-6 h-6 text-primary" />
                        {data.shipment.trackingNumber}
                      </CardTitle>
                      <CardDescription className="text-base flex items-center gap-2">
                        {getStatusIcon(data.shipment.status)}
                        <span className="font-medium capitalize text-foreground">{data.shipment.status.replace(/_/g, ' ')}</span>
                      </CardDescription>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="text-xl font-semibold">
                        {format(new Date(data.shipment.estimatedDelivery), 'EEEE, MMM dd')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  {/* Stepper */}
                  <div className="relative mb-12 px-4 sm:px-12">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
                    <div className="flex justify-between relative z-0">
                      {STEPS.map((step, idx) => {
                        const isCompleted = currentStepIndex >= idx;
                        const isCurrent = currentStepIndex === idx;
                        return (
                          <div key={step} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-background transition-colors ${
                              isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block capitalize ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-8 mb-8 p-6 bg-muted/20 rounded-xl">
                    <div className="flex gap-4">
                      <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Origin</p>
                        <p className="font-medium">{data.shipment.originCity}, {data.shipment.originCountry}</p>
                        <p className="text-sm text-muted-foreground mt-1">{data.shipment.originAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Map className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Destination</p>
                        <p className="font-medium">{data.shipment.destinationCity}, {data.shipment.destinationCountry}</p>
                        <p className="text-sm text-muted-foreground mt-1">{data.shipment.destinationAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Tracking History
                    </h3>
                    <div className="space-y-6 ml-2 border-l-2 border-muted pl-6">
                      {data.events.map((event, i) => (
                        <div key={event.id} className="relative">
                          <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                            <div>
                              <p className="font-medium capitalize">{event.status.replace(/_/g, ' ')}</p>
                              <p className="text-muted-foreground">{event.description}</p>
                              <p className="text-sm font-medium mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground sm:text-right shrink-0">
                              <p>{format(new Date(event.timestamp), 'MMM dd, yyyy')}</p>
                              <p>{format(new Date(event.timestamp), 'hh:mm a')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {data.events.length === 0 && (
                        <p className="text-muted-foreground text-sm py-4">No tracking events available yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
