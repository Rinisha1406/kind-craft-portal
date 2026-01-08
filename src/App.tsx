import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Matrimony from "./pages/Matrimony";
import MatrimonyProfile from "./pages/MatrimonyProfile";
import Members from "./pages/Members";
import Contact from "./pages/Contact";
import MemberProfile from "./pages/MemberProfile";
import MemberDashboard from "./pages/MemberDashboard";
import ManageServices from "./pages/member/ManageServices";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMatrimony from "./pages/admin/AdminMatrimony";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminServices from "./pages/admin/AdminServices";
import AdminMessages from "./pages/admin/AdminMessages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/matrimony" element={<Matrimony />} />
            <Route path="/matrimony/profile" element={<MatrimonyProfile />} />
            <Route path="/members" element={<Members />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/member/profile" element={<MemberProfile />} />
            <Route path="/member/dashboard" element={<MemberDashboard />} />
            <Route path="/member/manage-services" element={<ManageServices />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/matrimony" element={<AdminMatrimony />} />
            <Route path="/admin/members" element={<AdminMembers />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
