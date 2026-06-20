import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListCustomers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Plus, Search, Users, Building, Mail, Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useListCustomers({ search: search || undefined });

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'enterprise': return "bg-purple-100 text-purple-800 border-0 dark:bg-purple-900 dark:text-purple-300";
      case 'premium': return "bg-blue-100 text-blue-800 border-0 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 border-0 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your client base and their shipping history.</p>
          </div>
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers by name, email, or company..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : customers && customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Customer Name</th>
                      <th className="px-6 py-4 font-medium">Contact Info</th>
                      <th className="px-6 py-4 font-medium">Tier</th>
                      <th className="px-6 py-4 font-medium">Shipments</th>
                      <th className="px-6 py-4 font-medium">Total Spend</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{customer.name}</div>
                          {customer.company && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Building className="w-3 h-3" />
                              {customer.company}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-xs flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`capitalize ${getTierColor(customer.tier || 'standard')}`}>
                            {customer.tier || 'Standard'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-muted-foreground">
                          {customer.totalShipments || 0}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${(customer.totalSpend || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${customer.id}`}>Profile</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p>No customers found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
