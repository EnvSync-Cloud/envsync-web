
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Database, MoreHorizontal, Settings, Copy, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewProjectModal } from "./NewProjectModal";
import { ProjectEnvironments } from "./ProjectEnvironments";

export const Applications = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [applications, setApplications] = useState([
    {
      id: "app_1",
      name: "Frontend App",
      description: "React application for customer portal",
      configs: 3,
      secrets: 24,
      lastUpdated: "2 hours ago",
      status: "active",
    },
    {
      id: "app_2",
      name: "Backend API",
      description: "Node.js REST API for core services",
      configs: 4,
      secrets: 18,
      lastUpdated: "1 day ago",
      status: "active",
    },
    {
      id: "app_3",
      name: "Mobile App",
      description: "React Native mobile application",
      configs: 2,
      secrets: 12,
      lastUpdated: "3 days ago",
      status: "active",
    },
    {
      id: "app_4",
      name: "Data Pipeline",
      description: "Python ETL jobs for data processing",
      configs: 3,
      secrets: 15,
      lastUpdated: "1 week ago",
      status: "inactive",
    },
  ]);

  const handleCreateProject = (project: { name: string; description: string }) => {
    const newProject = {
      id: `app_${applications.length + 1}`,
      name: project.name,
      description: project.description,
      configs: 0,
      secrets: 0,
      lastUpdated: "Just now",
      status: "active",
    };
    setApplications([...applications, newProject]);
  };

  const handleProjectClick = (projectName: string) => {
    setSelectedProject(projectName);
  };

  if (selectedProject) {
    return (
      <ProjectEnvironments
        projectName={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-2">
            Manage your applications and their configurations
          </p>
        </div>
        <Button 
          onClick={() => setShowNewProjectModal(true)}
          className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card key={app.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3" onClick={() => handleProjectClick(app.name)}>
                  <div className="w-12 h-12 bg-gradient-to-br from-electric_indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{app.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        app.status === 'active' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-gray-700">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-gray-700">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent onClick={() => handleProjectClick(app.name)}>
              <p className="text-gray-400 text-sm mb-6">{app.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-white">{app.configs}</div>
                  <div className="text-xs text-gray-400">Configs</div>
                </div>
                <div className="text-center p-3 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-white">{app.secrets}</div>
                  <div className="text-xs text-gray-400">Secrets</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last updated</span>
                <span className="text-white">{app.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};
