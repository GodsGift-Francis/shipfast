import { Link, useLocation } from "wouter";
import { 
  Package2, LayoutDashboard, Package, FileText, Users, 
  Map, Bell, Receipt, Menu, LogOut, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@workspace/api-client-react";

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isLoading, isError } = useHealthCheck();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/shipments", label: "Shipments", icon: Package },
    { href: "/quotes", label: "Quotes", icon: FileText },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/invoices", label: "Invoices", icon: Receipt },
    { href: "/routes", label: "Routes", icon: Map },
    { href: "/notifications", label: "Alerts", icon: Bell },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Package2 className="w-6 h-6 text-accent" />
            <span>ShipFast Ops</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" asChild>
            <Link href="/">
              <LogOut className="w-4 h-4 mr-2" />
              Exit Portal
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                System Check...
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                System Offline
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Systems Operational
              </div>
            )}
            <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-background" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
