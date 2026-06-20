import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";

function Brand({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const text = tone === "paper" ? "text-background" : "text-foreground";
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${text}`} data-testid="link-brand">
      <span className="grid h-8 w-8 place-items-center rounded-[7px] bg-accent font-mono text-[11px] font-bold tracking-tight text-accent-foreground">
        SHF
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">ShipFast</span>
    </Link>
  );
}

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/track", label: "Track" },
  { href: "/quote", label: "Get a quote" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Brand />
            <nav className="hidden items-center gap-7 md:flex">
              {NAV.map((item) => {
                const active = item.href === "/track" ? location.startsWith("/track") : location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={`text-[13px] font-medium transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden text-[13px] font-medium text-muted-foreground hover:text-foreground sm:block"
                  data-testid="link-dashboard"
                >
                  {user?.firstName ? `Hi, ${user.firstName}` : "Dashboard"}
                </Link>
                <Button variant="outline" size="sm" onClick={logout} data-testid="button-logout">
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={login} className="hidden sm:inline-flex" data-testid="button-login">
                  Log in
                </Button>
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild data-testid="button-track-cta">
                  <Link href="/track">Track a package</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Brand tone="paper" />
              <p className="mt-4 max-w-xs text-sm text-primary-foreground/65">
                Freight and parcel logistics across 190+ countries, with live tracking and proactive status alerts.
              </p>
            </div>
            <FooterCol title="Company" links={["About", "Network", "Careers", "Press"]} />
            <FooterCol title="Services" links={["Express", "Freight", "International", "Warehousing"]} />
            <FooterCol title="Support" links={["Track", "Get a quote", "Contact", "Claims"]} />
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-primary-foreground/15 pt-6 font-mono text-[11px] uppercase tracking-wider text-primary-foreground/50 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} ShipFast Logistics</span>
            <span>5.5603° N, 0.1969° W · Accra HQ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-accent">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <span className="cursor-pointer text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
              {l}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
