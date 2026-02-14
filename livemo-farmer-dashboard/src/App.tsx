import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Animals from "./pages/Animals";
import AnimalProfile from "./pages/AnimalProfile";
import AnimalCreate from "./pages/AnimalCreate";
import AnimalEdit from "./pages/AnimalEdit";
import Health from "./pages/Health";
import Sensors from "./pages/Sensors";
import Feed from "./pages/Feed";
import Pasture from "./pages/Pasture";
import PastureDetails from "./pages/PastureDetails";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Marketplace from "./pages/Marketplace";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/animals" element={<Animals />} />
            <Route path="/animals/new" element={<AnimalCreate />} />
            <Route path="/animals/:id" element={<AnimalProfile />} />
            <Route path="/animals/:id/edit" element={<AnimalEdit />} />
            <Route path="/health" element={<Health />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/pasture" element={<Pasture />} />
            <Route path="/pasture/:id" element={<PastureDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
