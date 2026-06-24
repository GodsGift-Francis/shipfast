import { PortalLayout } from "@/components/layout/PortalLayout";
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, Receipt, AlertTriangle, Bell, 
  CheckCircle2, Clock, Trash2, MailOpen, MoreVertical,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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

  const handleMarkAllRead = () => {
    if (!notifications) return;
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    // In a real app we'd have a bulk endpoint, but here we follow the pattern
    Promise.all(unread.map(n => markRead.mutateAsync({ id: n.id })))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
        toast({ title: "Success", description: "All notifications marked as read" });
      });
  };

  const getNotificationConfig = (type: string) => {
    switch(type) {
      case 'shipment_update': return { icon: Package, color: "text-blue-500", bg: "bg-blue-50" };
      case 'delivery_alert': return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" };
      case 'invoice_due': return { icon: Receipt, color: "text-red-500", bg: "bg-red-50" };
      case 'quote_expiry': return { icon: Clock, color: "text-amber-500", bg: "bg-amber-50" };
      default: return { icon: AlertTriangle, color: "text-slate-500", bg: "bg-slate-50" };
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
            <p className="text-slate-500">Stay updated on your shipments, invoices, and account alerts.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllRead} 
              disabled={unreadCount === 0 || markRead.isPending}
              className="text-slate-600 border-slate-200"
            >
              <MailOpen className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Inbox Layout */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant={unreadCount > 0 ? "default" : "secondary"} className="rounded-full px-2">
                  {unreadCount} Unread
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-slate-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded" />
                      <div className="h-3 w-3/4 bg-slate-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notifications.map((note) => {
                  const config = getNotificationConfig(note.type);
                  const Icon = config.icon;
                  return (
                    <div 
                      key={note.id} 
                      className={`group flex gap-4 p-5 transition-all relative ${
                        note.read 
                          ? "bg-white opacity-70" 
                          : "bg-blue-50/30 border-l-4 border-l-primary"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-bold text-sm ${note.read ? 'text-slate-600' : 'text-slate-900'}`}>
                            {note.title}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">
                            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${note.read ? 'text-slate-500' : 'text-slate-700'}`}>
                          {note.message}
                        </p>
                      </div>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!note.read ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleMarkRead(note.id)} 
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                          >
                            <MailOpen className="w-4 h-4" />
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
                <p className="text-slate-500 max-w-xs">
                  We'll notify you here when there are updates to your shipments or account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
