import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Outlet } from "react-router-dom";

export const RootLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-electric_indigo-500 to-magenta-500 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">E$</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Authentication Required
          </h2>
          <p className="text-gray-400">
            You need to be signed in to access EnvSync.
          </p>
          {/* <div className="flex items-center justify-center space-x-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
            <span>Redirecting to login page...</span>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
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
