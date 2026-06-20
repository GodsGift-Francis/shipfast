import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Truck, FileText, Receipt, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();
  const markRead = useMarkNotificationRead();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to mark notification as read", variant: "destructive" });
      }
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'shipment_update': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivery_alert': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'quote_expiry': return <FileText className="w-5 h-5 text-amber-500" />;
      case 'invoice_due': return <Receipt className="w-5 h-5 text-red-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Alerts and system updates.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" /> All Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((note) => (
                  <div 
                    key={note.id} 
                    className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                      note.read ? "bg-muted/10 border-transparent" : "bg-card border-primary/20 shadow-sm"
                    }`}
                  >
                    <div className="shrink-0 mt-1">
                      {getIcon(note.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-4">
                        <p className={`font-medium ${!note.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {note.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm ${!note.read ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                        {note.message}
                      </p>
                    </div>
                    {!note.read && (
                      <div className="shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleMarkRead(note.id)} disabled={markRead.isPending}>
                          Mark Read
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
