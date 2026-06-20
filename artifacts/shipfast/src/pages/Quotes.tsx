import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListQuotes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Quotes() {
  const { data: quotes, isLoading } = useListQuotes();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'active': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'pending': return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case 'expired': return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">Manage active quote requests and pricing estimates.</p>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle>All Quotes</CardTitle>
            <CardDescription>History of requested estimates.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : quotes && quotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Quote ID</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Route</th>
                      <th className="px-6 py-4 font-medium">Service</th>
                      <th className="px-6 py-4 font-medium">Est. Cost</th>
                      <th className="px-6 py-4 font-medium">Requested</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          QT-{quote.id.toString().padStart(5, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span>{quote.originCity}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span>{quote.destinationCity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize">{quote.serviceType}</td>
                        <td className="px-6 py-4 font-medium">${quote.estimatedCost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{format(new Date(quote.createdAt), 'MMM dd, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>No quotes found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
