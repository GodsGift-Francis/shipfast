import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, FileText, Users, Map, Bell, Receipt, Menu, LogOut, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shipments", label: "Shipments", icon: Package },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/routes", label: "Routes", icon: Map },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-sidebar-foreground" data-testid="link-portal-brand">
      <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-accent font-mono text-[11px] font-bold tracking-tight text-accent-foreground">
        SHF
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">ShipFast Ops</span>
    </Link>
  );
}

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isLoading: healthLoading, isError } = useHealthCheck();
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary px-4 text-primary-foreground">
        <div className="space-y-5 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-foreground">SHF</span>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">ShipFast Operations</h1>
          <p className="text-primary-foreground/70">Log in to access the portal.</p>
          <Button onClick={login} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-portal-login">
            Log in to continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <BrandMark />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="px-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">Operations</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} data-testid={`link-portal-${item.label.toLowerCase()}`}>
                <div
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-accent/15 font-semibold text-accent"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-sidebar-border p-4">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
              </div>
            </div>
          )}
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={logout} data-testid="button-portal-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="md:hidden">
            <BrandMark />
          </div>
          <div className="ml-auto flex items-center gap-4">
            {healthLoading ? (
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-destructive">
                <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" /> Offline
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--chart-3))]">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" /> Operational
              </div>
            )}
            <Link href="/notifications" className="relative p-2 text-muted-foreground transition-colors hover:text-foreground" data-testid="link-portal-alerts">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-background bg-accent" />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
