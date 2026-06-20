import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListInvoices } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Plus, Search, Filter, Receipt, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Invoices() {
  const [status, setStatus] = useState<string>("all");
  
  const { data: invoices, isLoading } = useListInvoices({
    status: status !== "all" ? (status as any) : undefined
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'sent': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'draft': return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case 'overdue': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'cancelled': return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage billing and payments.</p>
          </div>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
            ) : invoices && invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Invoice Number</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-muted-foreground" />
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/customers/${invoice.customerId}`} className="hover:underline text-foreground">
                            {invoice.customerName || `Customer #${invoice.customerId}`}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${invoice.amount.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Receipt className="w-12 h-12 mb-4 opacity-20" />
                <p>No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
