import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListRoutes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Loader2, ArrowRight, Clock } from "lucide-react";

export default function Routes() {
  const { data: routes, isLoading } = useListRoutes();

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Routes</h1>
          <p className="text-muted-foreground">Logistics network coverage and baseline transit times.</p>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Network Overview</CardTitle>
            <CardDescription>Available origin and destination pairs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : routes && routes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Route Path</th>
                      <th className="px-6 py-4 font-medium">Service</th>
                      <th className="px-6 py-4 font-medium">Transit Time</th>
                      <th className="px-6 py-4 font-medium">Base Price</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {routes.map((route) => (
                      <tr key={route.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{route.originCity}, {route.originCountry}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{route.destinationCity}, {route.destinationCountry}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize">{route.serviceType}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {route.transitDays} days
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${route.basePrice.toFixed(2)} {route.currency}
                        </td>
                        <td className="px-6 py-4">
                          {route.active ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-0 dark:bg-green-900 dark:text-green-300">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-0 dark:bg-red-900 dark:text-red-300">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Map className="w-12 h-12 mb-4 opacity-20" />
                <p>No routes configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
