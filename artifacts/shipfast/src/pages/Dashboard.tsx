import { PortalLayout } from "@/components/layout/PortalLayout";
import { useGetDashboardStats, useGetRecentActivity, useGetShipmentsByStatus, useGetRevenueTrend } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, Truck, CheckCircle2, TrendingUp, Plus, 
  Download, Activity, Users, FileText, Map, ArrowUpRight, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 5 });
  const { data: statusData, isLoading: statusLoading } = useGetShipmentsByStatus();
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueTrend();

  const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b", // amber-500
    processing: "#3b82f6", // blue-500
    in_transit: "#6366f1", // indigo-500
    out_for_delivery: "#ec4899", // pink-500
    delivered: "#22c55e", // green-500
    cancelled: "#ef4444", // red-500
    on_hold: "#64748b", // slate-500
  };

  const getStatusIcon = (type: string) => {
    switch(type) {
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'status_update': return <Truck className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Operations Dashboard</h1>
            <p className="text-slate-500 mt-1">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/shipments/new" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Shipment
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard 
            title="Active Shipments" 
            value={stats?.activeShipments} 
            icon={Package} 
            color="bg-blue-500"
            trend="+12% from last month"
            loading={statsLoading} 
          />
          <KPICard 
            title="In Transit" 
            value={statusData?.find(s => s.status === 'in_transit')?.count || 0} 
            icon={Truck} 
            color="bg-indigo-500"
            trend="+5% from last month"
            loading={statusLoading} 
          />
          <KPICard 
            title="Delivered Today" 
            value={stats?.deliveredToday} 
            icon={CheckCircle2} 
            color="bg-green-500"
            trend="+18% from last month"
            loading={statsLoading} 
          />
          <KPICard 
            title="Monthly Revenue" 
            value={stats ? `$${(stats.monthlyRevenue / 1000).toFixed(1)}k` : undefined} 
            icon={TrendingUp} 
            color="bg-orange-500"
            trend="+24% from last month"
            prefix="$"
            loading={statsLoading} 
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Revenue Trend AreaChart */}
          <Card className="lg:col-span-7 border-slate-200 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Visualizing monthly revenue growth</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] pl-2">
              {revenueLoading ? (
                <Skeleton className="w-full h-full" />
              ) : revenueData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#64748b" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`$${value}k`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#1d4ed8" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 italic">No revenue data available</div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown PieChart */}
          <Card className="lg:col-span-5 border-slate-200 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Shipment Status</CardTitle>
              <CardDescription>Active network distribution</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex flex-col">
              {statusLoading ? (
                <Skeleton className="w-full h-full" />
              ) : statusData ? (
                <>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData.filter(d => d.status !== 'delivered' && d.status !== 'cancelled')}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="count"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#94a3b8'} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number, name: string) => [value, name.replace(/_/g, ' ')]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 pb-2">
                    {statusData.filter(d => d.status !== 'cancelled').slice(0, 4).map((entry) => (
                      <div key={entry.status} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status] }} />
                        <span className="text-xs font-medium text-slate-600 capitalize">{entry.status.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-bold ml-auto">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 italic">No status data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Live updates from your fleet</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-slate-300" />
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        {getStatusIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic">No recent activity detected</div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Frequent operational tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <ActionBtn 
                  label="Book Shipment" 
                  href="/shipments/new" 
                  icon={Package} 
                  variant="filled" 
                />
                <ActionBtn 
                  label="New Customer" 
                  href="/customers/new" 
                  icon={Users} 
                  variant="outline" 
                />
                <ActionBtn 
                  label="Create Invoice" 
                  href="/invoices/new" 
                  icon={FileText} 
                  variant="outline" 
                />
                <ActionBtn 
                  label="View Routes" 
                  href="/routes" 
                  icon={Map} 
                  variant="ghost" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

function KPICard({ 
  title, value, icon: Icon, color, trend, prefix, loading 
}: { 
  title: string; value?: number | string; icon: any; color: string; trend: string; prefix?: string; loading: boolean 
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />
            {trend.split(' ')[0]}
          </div>
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-1" />
          ) : (
            <p className="text-3xl font-black text-slate-900">{value ?? "-"}</p>
          )}
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
        <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-wider font-bold">
          {trend.split(' ').slice(1).join(' ')}
        </p>
      </CardContent>
    </Card>
  );
}

function ActionBtn({ label, href, icon: Icon, variant }: { label: string; href: string; icon: any; variant: 'filled' | 'outline' | 'ghost' }) {
  const baseStyles = "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all h-full";
  const variants = {
    filled: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
    outline: "bg-white border-2 border-slate-100 text-slate-700 hover:border-primary/20 hover:bg-slate-50",
    ghost: "bg-slate-50 text-slate-600 hover:bg-slate-100"
  };

  return (
    <Link href={href}>
      <div className={`${baseStyles} ${variants[variant]}`}>
        <Icon className={`w-6 h-6 ${variant === 'filled' ? 'text-white' : 'text-primary'}`} />
        <span className="text-sm font-bold text-center">{label}</span>
      </div>
    </Link>
  );
}
