import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Database,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewProjectModal } from "@/components/NewProjectModal";
import { ProjectEnvironments } from "@/components/ProjectEnvironments";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface App {
  id: string;
  org_id: string;
  name: string;
  description: string;
	metadata: Record<string, any>;
  status?: string;
  created_at: Date;
  updated_at: Date;
}

export const Applications = () => {
  const { api } = useAuth();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [applications, setApplications] = useState<App[]>([]);

  const queryClient = useQueryClient();

  const { data: appsData } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await api.applications.getApps();

      const apps = response.map((app) => ({
        id: app.id,
        org_id: app.org_id,
        name: app.name,
        description: app.description,
        metadata: app.metadata || {},
        status: "active",
        created_at: new Date(app.created_at),
        updated_at: new Date(app.updated_at),
      }));

      setApplications(apps);
      queryClient.setQueryData(["applications"], apps);

      return apps;
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      await api.applications.deleteApp(projectId);
      setApplications((prev) => prev.filter((app) => app.id !== projectId));
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
    },
  });

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    if (deleteProject.isPending) return; // Prevent multiple clicks

    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    deleteProject.mutate(projectId);
  };

  if (!appsData || appsData.length === 0) {
    return (
      <div className="text-center text-slate-400">
        <p>No projects found. Create a new project to get started.</p>
        <Button
          onClick={() => setShowNewProjectModal(true)}
          className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>
    );
  }

  if (selectedProjectId) {
    return (
      <ProjectEnvironments
        projectNameId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-2">
            Manage your applications and their configurations
          </p>
        </div>
        <Button
          onClick={() => setShowNewProjectModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <Card
            key={app.id}
            className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div
                  className="flex items-center space-x-3"
                  onClick={() => handleProjectClick(app.id)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">
                      {app.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          app.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-slate-700"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700">
                    <DropdownMenuItem className="text-red-400 hover:bg-slate-700">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProject(app.id)}
                        className="w-full text-left"
                        disabled={deleteProject.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent onClick={() => handleProjectClick(app.id)}>
              <p className="text-slate-400 text-sm mb-6">{app.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="text-2xl font-bold text-white">
                    0
                  </div>
                  <div className="text-xs text-slate-400">Configs</div>
                </div>
                <div className="text-center p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="text-2xl font-bold text-white">
                    0
                  </div>
                  <div className="text-xs text-slate-400">Secrets</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Last updated</span>
                <span className="text-slate-300">{app.updated_at?.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />
    </div>
  );
};

export default Applications;
