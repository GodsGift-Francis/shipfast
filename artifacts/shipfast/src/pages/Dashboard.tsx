import { PortalLayout } from "@/components/layout/PortalLayout";
import { useGetDashboardStats, useGetRecentActivity, useGetShipmentsByStatus, useGetRevenueTrend } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 5 });
  const { data: statusData, isLoading: statusLoading } = useGetShipmentsByStatus();
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueTrend();

  const STATUS_COLORS: Record<string, string> = {
    pending: "#E8A22A",
    processing: "#4E8FB0",
    in_transit: "#2E6F95",
    out_for_delivery: "#C8821A",
    delivered: "#0F7B6C",
    cancelled: "#C0392B",
    on_hold: "#7A8794",
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Operations overview</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Dashboard</h1>
        </div>

        {/* Stats Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Active" 
            value={stats?.activeShipments} 
            icon={Package} 
            loading={statsLoading} 
          />
          <StatsCard 
            title="In Transit" 
            value={statusData?.find(s => s.status === 'in_transit')?.count || 0} 
            icon={Truck} 
            loading={statusLoading} 
          />
          <StatsCard 
            title="Delivered Today" 
            value={stats?.deliveredToday} 
            icon={CheckCircle2} 
            loading={statsLoading} 
          />
          <StatsCard 
            title="Monthly Revenue" 
            value={stats ? `$${(stats.monthlyRevenue / 1000).toFixed(1)}k` : undefined} 
            icon={TrendingUp} 
            loading={statsLoading} 
          />
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/* Revenue Chart */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="font-display">Revenue trend</CardTitle>
              <CardDescription>Monthly revenue vs shipments</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {revenueLoading ? (
                <Skeleton className="w-full h-full" />
              ) : revenueData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="shipments" stroke="hsl(var(--accent))" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="font-display">Shipment status</CardTitle>
              <CardDescription>Current state of all active shipments</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {statusLoading ? (
                <Skeleton className="w-full h-full" />
              ) : statusData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.filter(d => d.status !== 'delivered' && d.status !== 'cancelled')}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="status"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || 'hsl(var(--muted))'} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', textTransform: 'capitalize' }}
                      formatter={(value: number, name: string) => [value, name.replace(/_/g, ' ')]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent activity</CardTitle>
            <CardDescription>Latest updates across your network</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {item.type === 'delivered' ? <CheckCircle2 className="w-5 h-5 text-[hsl(var(--chart-3))]" /> :
                       item.type === 'status_update' ? <Truck className="w-5 h-5 text-primary" /> :
                       <AlertTriangle className="w-5 h-5 text-accent" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

function StatsCard({ title, value, icon: Icon, loading }: { title: string; value?: number | string; icon: any; loading: boolean }) {
  return (
    <Card className="relative overflow-hidden">
      <span className="absolute left-0 top-0 h-full w-1 bg-accent" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <div className="font-display text-3xl font-extrabold tracking-tight">{value ?? "-"}</div>
        )}
      </CardContent>
    </Card>
  );
}
