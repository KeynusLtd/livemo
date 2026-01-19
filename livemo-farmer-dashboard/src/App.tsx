import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Animals from "./pages/Animals";
import Health from "./pages/Health";
import Sensors from "./pages/Sensors";
import Feed from "./pages/Feed";
import Pasture from "./pages/Pasture";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/health" element={<Health />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/pasture" element={<Pasture />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/marketplace" element={<Marketplace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
