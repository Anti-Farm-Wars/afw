import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ClanLookup from "./pages/ClanLookup";
import PlayerLookup from "./pages/PlayerLookup";
import ManageAssociations from "./pages/ManageAssociations";
import StaffAuth from "./pages/StaffAuth";
import StaffDashboard from "./pages/StaffDashboard";
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
          <Route path="/clan-lookup" element={<ClanLookup />} />
          <Route path="/player-lookup" element={<PlayerLookup />} />
          <Route path="/manage-associations" element={<ManageAssociations />} />
          <Route path="/staff" element={<StaffAuth />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
