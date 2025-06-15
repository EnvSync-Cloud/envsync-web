import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "@/contexts/provider";
import Routes from "@/pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthContextProvider>
      <TooltipProvider>
        <div className="h-screen overflow-hidden">
          <Toaster />
          <Sonner />
          <Routes />
        </div>
      </TooltipProvider>
    </AuthContextProvider>
  </QueryClientProvider>
);

export default App;
