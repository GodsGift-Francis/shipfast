import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Track from "@/pages/Track";
import QuoteRequest from "@/pages/QuoteRequest";
import Services from "@/pages/Services";

import Dashboard from "@/pages/Dashboard";
import Shipments from "@/pages/Shipments";
import ShipmentNew from "@/pages/ShipmentNew";
import ShipmentDetail from "@/pages/ShipmentDetail";
import Quotes from "@/pages/Quotes";
import Customers from "@/pages/Customers";
import CustomerNew from "@/pages/CustomerNew";
import CustomerDetail from "@/pages/CustomerDetail";
import Invoices from "@/pages/Invoices";
import InvoiceNew from "@/pages/InvoiceNew";
import Notifications from "@/pages/Notifications";
import Routes from "@/pages/Routes";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/track" component={Track} />
      <Route path="/track/:trackingNumber" component={Track} />
      <Route path="/quote" component={QuoteRequest} />
      <Route path="/services" component={Services} />

      {/* Portal Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/shipments" component={Shipments} />
      <Route path="/shipments/new" component={ShipmentNew} />
      <Route path="/shipments/:id" component={ShipmentDetail} />
      <Route path="/quotes" component={Quotes} />
      <Route path="/customers" component={Customers} />
      <Route path="/customers/new" component={CustomerNew} />
      <Route path="/customers/:id" component={CustomerDetail} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/invoices/new" component={InvoiceNew} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/routes" component={Routes} />
      
      {/* Catch All */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
