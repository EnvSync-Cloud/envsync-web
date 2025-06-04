
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Database, Calendar, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Applications = () => {
  const [applications] = useState([
    {
      id: "app_1",
      name: "Frontend App",
      description: "React application for customer portal",
      envCount: 24,
      lastUpdated: "2 hours ago",
      status: "active",
    },
    {
      id: "app_2",
      name: "Backend API",
      description: "Node.js REST API for core services",
      envCount: 18,
      lastUpdated: "1 day ago",
      status: "active",
    },
    {
      id: "app_3",
      name: "Data Pipeline",
      description: "Python ETL jobs for data processing",
      envCount: 12,
      lastUpdated: "3 days ago",
      status: "inactive",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-gray-400 mt-2">
            Manage your applications and their environment variables
          </p>
        </div>
        <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card key={app.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-violet-500" />
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">{app.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Environment Variables</span>
                  <span className="font-medium">{app.envCount}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    app.status === 'active' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {app.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Updated</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{app.lastUpdated}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-gray-600 hover:bg-gray-700 text-white"
              >
                View Variables
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
