
import { Toaster } from "@/components/UI/toaster";
import { Toaster as Sonner } from "@/components/UI/sonner";
import { TooltipProvider } from "@/components/UI/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ActivityIcon } from "lucide-react";
import { AuthProvider, RequireAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TodosPage from "./pages/TodosPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import SettingsPage from "./pages/SettingsPage";
import Files from "./pages/Files";
import AIAnalysis from "./pages/AIAnalysis";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="h-screen flex items-center justify-center">
    <div className="animate-pulse">
      <ActivityIcon className="h-12 w-12 text-primary" />
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/appointments" element={
        <RequireAuth>
          <Layout><Appointments /></Layout>
        </RequireAuth>
      } />
      <Route path="/prescriptions" element={<Layout><Prescriptions /></Layout>} />
      <Route path="/todos" element={
        <RequireAuth>
          <Layout><TodosPage /></Layout>
        </RequireAuth>
      } />
      <Route path="/workouts" element={
        <RequireAuth>
          <Layout><WorkoutsPage /></Layout>
        </RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth>
          <Layout><Profile /></Layout>
        </RequireAuth>
      } />
      <Route path="/files" element={
        <RequireAuth>
          <Layout><Files /></Layout>
        </RequireAuth>
      } />
      <Route path="/settings" element={
        <RequireAuth>
          <Layout><SettingsPage /></Layout>
        </RequireAuth>
      } />
      <Route path="/ai-analysis" element={
        <RequireAuth>
          <Layout><AIAnalysis /></Layout>
        </RequireAuth>
      } />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
