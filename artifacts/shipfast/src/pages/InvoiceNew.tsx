import { PortalLayout } from "@/components/layout/PortalLayout";
import { useCreateInvoice, getListInvoicesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Receipt } from "lucide-react";

export default function InvoiceNew() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createInvoice = useCreateInvoice();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      customerId: parseInt(formData.get("customerId") as string, 10),
      amount: Number(formData.get("amount")),
      currency: formData.get("currency") as string,
      dueDate: formData.get("dueDate") as string,
      notes: formData.get("notes") as string,
    };

    createInvoice.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Invoice Created", description: "The invoice has been generated successfully." });
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        setLocation(`/invoices`);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to create invoice.", variant: "destructive" });
      }
    });
  };

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Invoice</h1>
          <p className="text-muted-foreground">Generate a new billing invoice for a customer.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input type="number" id="customerId" name="customerId" required placeholder="e.g. 1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input type="number" id="amount" name="amount" required min="0" step="0.01" placeholder="e.g. 150.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" name="currency" defaultValue="USD" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input type="date" id="dueDate" name="dueDate" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes / Terms</Label>
                  <Textarea id="notes" name="notes" placeholder="Any specific payment terms?" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" type="button" onClick={() => setLocation("/invoices")}>Cancel</Button>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Generating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
