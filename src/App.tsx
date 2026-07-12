import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import Index from "./pages/Index";
import ClanLookup from "./pages/ClanLookup";
import ClanCWL from "./pages/ClanCWL";
import PlayerLookup from "./pages/PlayerLookup";
import ManageAssociations from "./pages/ManageAssociations";
import StaffAuth from "./pages/StaffAuth";
import StaffDashboard from "./pages/StaffDashboard";
import ApiDocumentation from "./pages/ApiDocumentation";
import WarSync from "./pages/WarSync";
import WarMatchTracker from "./pages/WarMatchTracker";
import SyncUpdate from "./pages/SyncUpdate";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/clan-lookup" element={<ClanLookup />} />
            <Route path="/clan-cwl" element={<ClanCWL />} />
            <Route path="/player-lookup" element={<PlayerLookup />} />
            <Route path="/manage-associations" element={<ManageAssociations />} />
            
            <Route path="/staff" element={<StaffAuth />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/api-docs" element={<ApiDocumentation />} />
            <Route path="/sync" element={<WarSync />} />
            <Route path="/war-tracker" element={<WarMatchTracker />} />

            <Route path="/sync-update" element={<SyncUpdate />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
