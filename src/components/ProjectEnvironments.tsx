import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  Search,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you have a toast library

interface ProjectEnvironmentsProps {
  projectNameId: string;
  onBack: () => void;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  sensitive: boolean;
}

interface EnvironmentType {
  id: string;
  name: string;
  color: string;
}

interface EnvVarFormData {
  key: string;
  value: string;
  sensitive: boolean;
}

export const ProjectEnvironments = ({
  projectNameId,
  onBack,
}: ProjectEnvironmentsProps) => {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  // UI State
  const [searchEnv, setSearchEnv] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dialog States
  const [showAddEnvVarDialog, setShowAddEnvVarDialog] = useState(false);
  const [showEditEnvVarDialog, setShowEditEnvVarDialog] = useState(false);
  const [showDeleteEnvVarDialog, setShowDeleteEnvVarDialog] = useState(false);
  
  // Form States
  const [editingEnvVar, setEditingEnvVar] = useState<EnvironmentVariable | null>(null);
  const [formData, setFormData] = useState<EnvVarFormData>({
    key: "",
    value: "",
    sensitive: false,
  });

  // Memoized color generator
  const getEnvironmentColor = useCallback((envName: string) => {
    const colors = [
      "bg-electric_indigo-500",
      "bg-violet-500",
      "bg-veronica-500",
      "bg-magenta-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
    ];
    const index = Math.abs(
      envName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;
    return colors[index];
  }, []);

  // Fetch project data and environment types
  const { data: projectData, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectNameId],
    queryFn: async () => {
      const [appData, environmentTypes] = await Promise.all([
        api.applications.getApp(projectNameId),
        api.environmentTypes.getEnvTypes(),
      ]);

      const environments = environmentTypes.map((envType) => ({
        id: envType.id,
        name: envType.name,
        color: getEnvironmentColor(envType.name),
      }));

      // Set initial selected environment
      if (environmentTypes.length > 0 && !selectedEnv) {
        setSelectedEnv(environmentTypes[0].id);
      }

      return {
        project: appData,
        environments,
      };
    },
    enabled: !!projectNameId,
  });

  // Fetch environment variables for selected environment
  const { 
    data: envVars = [], 
    isLoading: isEnvVarsLoading,
    error: envVarsError 
  } = useQuery({
    queryKey: ["envVars", projectNameId, selectedEnv],
    queryFn: async () => {
      if (!selectedEnv) return [];
      const envVarsData = await api.environmentVariables.getEnvs({
        app_id: projectNameId,
        env_type_id: selectedEnv,
      });
      return envVarsData.map((envVar) => ({
        key: envVar.key,
        value: envVar.value,
        sensitive: false,
      }));
    },
    enabled: !!selectedEnv && !!projectNameId,
  });

  // Mutations
  const addEnvVarMutation = useMutation({
    mutationFn: async (envVar: EnvVarFormData) => {
      if (!selectedEnv) throw new Error("No environment selected");
      return api.environmentVariables.createEnv({
        app_id: projectNameId,
        env_type_id: selectedEnv,
        key: envVar.key,
        value: envVar.value,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["envVars", projectNameId, selectedEnv] });
      toast.success("Environment variable added successfully");
      resetForm();
      setShowAddEnvVarDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to add environment variable: ${error.message}`);
    },
  });

  const updateEnvVarMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!selectedEnv) throw new Error("No environment selected");
      return api.environmentVariables.updateEnv(key, {
        app_id: projectNameId,
        env_type_id: selectedEnv,
        value
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["envVars", projectNameId, selectedEnv] });
      toast.success("Environment variable updated successfully");
      resetForm();
      setShowEditEnvVarDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to update environment variable: ${error.message}`);
    },
  });

  const deleteEnvVarMutation = useMutation({
    mutationFn: async (key: string) => {
      if (!selectedEnv) throw new Error("No environment selected");
      return api.environmentVariables.deleteEnv({
        app_id: projectNameId,
        env_type_id: selectedEnv,
        key,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["envVars", projectNameId, selectedEnv] });
      toast.success("Environment variable deleted successfully");
      setShowDeleteEnvVarDialog(false);
      setEditingEnvVar(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete environment variable: ${error.message}`);
    },
  });

  // Helper functions
  const resetForm = useCallback(() => {
    setFormData({ key: "", value: "", sensitive: false });
    setEditingEnvVar(null);
  }, []);

  const handleFormChange = useCallback((field: keyof EnvVarFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.key.trim()) {
      toast.error("Key is required");
      return false;
    }
    if (!formData.value.trim()) {
      toast.error("Value is required");
      return false;
    }
    // Check for duplicate keys when adding
    if (!editingEnvVar && envVars.some(envVar => envVar.key === formData.key)) {
      toast.error("Key already exists");
      return false;
    }
    return true;
  }, [formData, envVars, editingEnvVar]);

  // Event handlers
  const handleAddEnvVar = useCallback(() => {
    if (!validateForm()) return;
    addEnvVarMutation.mutate(formData);
  }, [formData, validateForm, addEnvVarMutation]);

  const handleEditEnvVar = useCallback((envVar: EnvironmentVariable) => {
    setEditingEnvVar(envVar);
    setFormData({
      key: envVar.key,
      value: envVar.value,
      sensitive: envVar.sensitive,
    });
    setShowEditEnvVarDialog(true);
  }, []);

  const handleUpdateEnvVar = useCallback(() => {
    if (!validateForm() || !editingEnvVar) return;
    updateEnvVarMutation.mutate({
      key: editingEnvVar.key,
      value: formData.value,
    });
  }, [formData, editingEnvVar, validateForm, updateEnvVarMutation]);

  const handleDeleteEnvVar = useCallback(() => {
    if (!editingEnvVar) return;
    deleteEnvVarMutation.mutate(editingEnvVar.key);
  }, [editingEnvVar, deleteEnvVarMutation]);

  const handleCopyValue = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success("Value copied to clipboard!");
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error("Failed to copy value");
    }
  }, []);

  const toggleValueVisibility = useCallback((key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const maskValue = useCallback((value: string) => {
    return "•".repeat(Math.min(value.length, 20));
  }, []);

  // Memoized computed values
  const filteredVars = useMemo(() => {
    return envVars.filter(envVar =>
      envVar.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [envVars, searchQuery]);

  const filteredEnvironments = useMemo(() => {
    if (!projectData?.environments) return [];
    return projectData.environments.filter(env =>
      env.name.toLowerCase().includes(searchEnv.toLowerCase())
    );
  }, [projectData?.environments, searchEnv]);

  const selectedEnvironment = useMemo(() => {
    return projectData?.environments.find(env => env.id === selectedEnv);
  }, [projectData?.environments, selectedEnv]);

  // Loading states
  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading project...</div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Failed to load project data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {projectData.project.name}
            </h1>
            <p className="text-gray-400 mt-2">Manage environment variables</p>
          </div>
        </div>
        <Button
          className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
          onClick={() => {
            resetForm();
            setShowAddEnvVarDialog(true);
          }}
          disabled={!selectedEnv}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Secret
        </Button>
      </div>

      {/* Add Environment Variable Dialog */}
      <Dialog open={showAddEnvVarDialog} onOpenChange={setShowAddEnvVarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Environment Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Key"
              value={formData.key}
              onChange={(e) => handleFormChange("key", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              placeholder="Value"
              value={formData.value}
              onChange={(e) => handleFormChange("value", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddEnvVarDialog(false)}
              disabled={addEnvVarMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEnvVar}
              disabled={addEnvVarMutation.isPending}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            >
              {addEnvVarMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Environment Variable Dialog */}
      <Dialog open={showEditEnvVarDialog} onOpenChange={setShowEditEnvVarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Environment Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Key"
              value={formData.key}
              disabled
              className="bg-gray-800 border-gray-700 text-white opacity-50"
            />
            <Input
              placeholder="Value"
              value={formData.value}
              onChange={(e) => handleFormChange("value", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditEnvVarDialog(false)}
              disabled={updateEnvVarMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEnvVar}
              disabled={updateEnvVarMutation.isPending}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            >
              {updateEnvVarMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Environment Variable Dialog */}
      <Dialog open={showDeleteEnvVarDialog} onOpenChange={setShowDeleteEnvVarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Environment Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">
              Are you sure you want to delete the environment variable "{editingEnvVar?.key}"?
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteEnvVarDialog(false)}
              disabled={deleteEnvVarMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEnvVar}
              disabled={deleteEnvVarMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteEnvVarMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Environment Selection and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <Select value={selectedEnv} onValueChange={setSelectedEnv}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 p-1 border-gray-700 text-white">
              <Input
                placeholder="Search environments..."
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 mb-2"
                value={searchEnv}
                onChange={(e) => setSearchEnv(e.target.value)}
              />
              {filteredEnvironments.map((env) => (
                <SelectItem
                  key={env.id}
                  value={env.id}
                  className="focus:bg-gray-700"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${env.color} mr-2`}
                    />
                    {env.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 focus:border-electric_indigo-500 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Environment Variables Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {selectedEnvironment?.name} Environment
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-700 text-white">
              {filteredVars.length} secrets
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isEnvVarsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading environment variables...</div>
            </div>
          ) : envVarsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-400">Failed to load environment variables</div>
            </div>
          ) : filteredVars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <div className="text-lg mb-2">No environment variables found</div>
              <div className="text-sm">
                {searchQuery ? "Try adjusting your search" : "Add your first secret to get started"}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVars.map((envVar) => (
                <div
                  key={envVar.key}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-mono font-medium text-blue-800">
                        {envVar.key}
                      </span>
                      {envVar.sensitive && (
                        <Badge variant="destructive" className="text-xs">
                          Sensitive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={
                          showValues[envVar.key]
                            ? envVar.value
                            : maskValue(envVar.value)
                        }
                        readOnly
                        className="bg-gray-800 border-gray-700 font-mono text-sm text-white"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleValueVisibility(envVar.key)}
                        className="text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        {showValues[envVar.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={() => handleCopyValue(envVar.value, envVar.key)}
                    >
                      {copiedKey === envVar.key ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={() => handleEditEnvVar(envVar)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                      onClick={() => {
                        setEditingEnvVar(envVar);
                        setShowDeleteEnvVarDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
