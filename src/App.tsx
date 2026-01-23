import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Architecture from "./pages/Architecture";
import Members from "./pages/Members";
import Kids from "./pages/Kids";
import Guardians from "./pages/Guardians";
import Events from "./pages/Events";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import GuardianPortal from "./pages/GuardianPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/members" element={<Members />} />
            <Route
              path="/kids"
              element={
                <ProtectedRoute>
                  <Kids />
              </ProtectedRoute>
            }
            />
            <Route path="/guardians" element={<Guardians />} />
            <Route path="/events" element={<Events />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guardian"
              element={
                <ProtectedRoute requiredRoles={['guardian']}>
                  <GuardianPortal />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
