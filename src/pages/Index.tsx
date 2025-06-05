
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { Applications } from "@/components/Applications";
import { Users } from "@/components/Users";
import { Settings } from "@/components/Settings";
import { AuditLogs } from "@/components/AuditLogs";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const {user, isAuthenticated, isLoading} = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen text-white">You are not authenticated.</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-white">User data not available.</div>;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard whoami={user} />;
      case "applications":
        return <Applications />;
      case "users":
        return <Users />;
      case "settings":
        return <Settings />;
      case "audit":
        return <AuditLogs />;
      default:
        return <Dashboard whoami={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
