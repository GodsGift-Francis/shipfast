import { Link, useLocation } from "wouter";
import { Package2, Search, FileText, Users, Map, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <Package2 className="w-6 h-6 text-accent" />
              <span>ShipFast</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/services" className={location === "/services" ? "text-primary" : "hover:text-primary transition-colors"}>Services</Link>
              <Link href="/track" className={location.startsWith("/track") ? "text-primary" : "hover:text-primary transition-colors"}>Track</Link>
              <Link href="/quote" className={location === "/quote" ? "text-primary" : "hover:text-primary transition-colors"}>Get Quote</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Portal Login</Link>
            <Button asChild size="sm">
              <Link href="/track">Track Package</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Package2 className="w-6 h-6 text-accent" />
            <span>ShipFast Global</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} ShipFast Logistics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
