import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, Filter, Download } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

type AuditLog = {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
  type: string;
  project: string;
  environment: string;
}

export const AuditLogs = () => {
  const { api } = useAuth();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const {
    data: logsData,
    isLoading,
  } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const auditLogs = await api.auditLogs.getAuditLogs();
      const users = await api.users.getUsers();
      const logs = auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        user: users.find((user) => user.id === log.user_id)?.full_name || "Unknown",
        timestamp: new Date(log.created_at).toLocaleString(),
        project: "",
        environment: "",
        type: "",
      }));
      setAuditLogs(logs);
      return logs;
    },
  });

  const getActionBadgeColor = (type: string) => {
    switch (type) {
      case "create":
        return "bg-green-900 text-green-300 border-green-800";
      case "update":
        return "bg-electric_indigo-900 text-electric_indigo-300 border-electric_indigo-800";
      case "delete":
        return "bg-red-900 text-red-300 border-red-800";
      default:
        return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "create":
        return "✓";
      case "update":
        return "⟳";
      case "delete":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity</h1>
          <p className="text-gray-400 mt-2">
            Track all activities and changes in your workspace
          </p>
        </div>
        <Button
          variant="outline"
          className="border-gray-600 text-white hover:bg-gray-700 rounded-xl"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search activity..."
              className="pl-10 bg-gray-800 border-gray-700 focus:border-electric_indigo-500 text-white placeholder-gray-400 rounded-xl"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electric_indigo-500">
            <option>All Actions</option>
            <option>Creates</option>
            <option>Updates</option>
            <option>Deletes</option>
          </select>

          <select className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electric_indigo-500">
            <option>All Users</option>
            <option>John Doe</option>
            <option>Jane Smith</option>
            <option>Admin</option>
          </select>

          <select className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-electric_indigo-500">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Custom range</option>
          </select>

          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700 rounded-xl"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Event
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Environment
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <h3 className="font-medium text-white">{log.action}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {log.details}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {log.project}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {log.environment}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {log.timestamp}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={`${getActionBadgeColor(log.type)} border`}
                      >
                        <span className="mr-1">{getActionIcon(log.type)}</span>
                        {log.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
