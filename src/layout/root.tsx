import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-emerald-500 border-slate-700 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Authentication Required
          </h2>
          <p className="text-slate-400">
            You need to be signed in to access EnvSync.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
