import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListCustomers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Search, Users, Building, Mail, Phone, Eye, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useListCustomers({ search: search || undefined });

  const getTierConfig = (tier: string) => {
    switch(tier?.toLowerCase()) {
      case 'enterprise': return { color: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", label: "Enterprise" };
      case 'premium': return { color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Premium" };
      default: return { color: "bg-slate-500", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", label: "Standard" };
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h1>
            <p className="text-slate-500">Manage your global client relationships and shipping tiers.</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Link>
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Clients</p>
            <p className="text-2xl font-black text-slate-900">{customers?.length || 0}</p>
          </Card>
          <Card className="p-4 border-slate-200 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active This Month</p>
            <p className="text-2xl font-black text-primary">{(customers?.length || 0) > 0 ? Math.floor(customers!.length * 0.8) : 0}</p>
          </Card>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search customers by name, email, or company..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Customer</TableHead>
                    <TableHead className="font-bold text-slate-700">Contact</TableHead>
                    <TableHead className="font-bold text-slate-700">Tier</TableHead>
                    <TableHead className="font-bold text-slate-700">Shipments</TableHead>
                    <TableHead className="font-bold text-slate-700">Total Spend</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : customers && customers.length > 0 ? (
                    customers.map((customer) => {
                      const tier = getTierConfig(customer.tier || 'standard');
                      return (
                        <TableRow key={customer.id} className="group hover:bg-slate-50/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className={`h-9 w-9 border-2 ${tier.border}`}>
                                <AvatarFallback className={`${tier.bg} ${tier.text} font-bold`}>
                                  {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-bold text-slate-900">{customer.name}</div>
                                {customer.company && (
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-tight font-medium">
                                    <Building className="w-3 h-3" />
                                    {customer.company}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-xs flex items-center gap-1.5 text-slate-600">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="text-xs flex items-center gap-1.5 text-slate-600">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize font-bold text-[10px] px-2 py-0 h-5 ${tier.bg} ${tier.text} ${tier.border}`}>
                              {tier.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{customer.totalShipments || 0}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">units</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-black text-slate-900">
                              ${(customer.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary">
                              <Link href={`/customers/${customer.id}`}>
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
                      <TableCell colSpan={6} className="h-72 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-200" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">No customers found</p>
                            <p className="text-sm text-slate-500">Add your first client to start shipping.</p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href="/customers/new">Create Customer Profile</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
