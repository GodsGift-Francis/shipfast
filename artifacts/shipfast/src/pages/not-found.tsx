import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-none shadow-none bg-transparent">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2 justify-center">
              <AlertCircle className="h-12 w-12 text-destructive opacity-80" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">404</h1>
            <h2 className="text-xl font-medium text-foreground mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you are looking for does not exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Portal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
