
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { Applications } from "@/components/Applications";
import { Environments } from "@/components/Environments";
import { Users } from "@/components/Users";
import { Settings } from "@/components/Settings";
import { AuditLogs } from "@/components/AuditLogs";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "applications":
        return <Applications />;
      case "environments":
        return <Environments />;
      case "users":
        return <Users />;
      case "settings":
        return <Settings />;
      case "audit":
        return <AuditLogs />;
      default:
        return <Dashboard />;
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
