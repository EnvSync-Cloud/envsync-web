import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { 
  EnvVarFormData, 
  BulkEnvVarData, 
  EnvironmentVariable,
  EnvironmentType,
  Project
} from "@/api/constants";

export const useProjectEnvironments = (projectNameId: string) => {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  // Fetch project data
  const { 
    data: projectData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["project-environments", projectNameId],
    queryFn: async () => {
      const projectResponse = await api.applications.getApp(projectNameId);

    const envVarsResponse = await api.environmentVariables.getEnvs({
        app_id: projectNameId,
        env_type_id: projectResponse.env_types[0].id
    });

      // Transform environment types
      const environmentTypes: EnvironmentType[] = projectResponse.env_types.map(envType => ({
        id: envType.id,
        name: envType.name,
        color: envType.color || "#6366f1",
      }));

      // Transform environment variables
      const environmentVariables: EnvironmentVariable[] = envVarsResponse.map(envVar => ({
        id: envVar.id,
        key: envVar.key,
        value: envVar.value,
        sensitive: false,
        app_id: envVar.app_id,
        env_type_id: envVar.env_type_id,
        created_at: new Date(envVar.created_at),
        updated_at: new Date(envVar.updated_at),
        created_by: {
            email: "dev@test.com",
            id: "dev-id",
            name: "Developer",
        }
      }));

      const project: Project = {
        id: projectResponse.id,
        name: projectResponse.name,
        description: projectResponse.description,
        created_at: new Date(projectResponse.created_at),
        updated_at: new Date(projectResponse.updated_at),
      };

      return {
        project,
        environmentTypes,
        environmentVariables,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
  });

  // Create environment variable
  const createVariable = useMutation({
    mutationFn: async (data: EnvVarFormData) => {
      return await api.environmentVariables.createEnv({
        key: data.key,
        value: data.value,
        env_type_id: data.env_type_id,
        app_id: projectNameId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-environments", projectNameId] });
      toast.success("Environment variable created successfully");
    },
    onError: (error) => {
      console.error("Failed to create environment variable:", error);
      toast.error("Failed to create environment variable");
    },
  });

  // Update environment variable
  const updateVariable = useMutation({
    mutationFn: async ({ variableId, data }: { variableId: string; data: Partial<EnvVarFormData> }) => {
      return await api.environmentVariables.updateEnv(data.key, {
        value: data.value,
        env_type_id: data.env_type_id,
        app_id: projectNameId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-environments", projectNameId] });
      toast.success("Environment variable updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update environment variable:", error);
      toast.error("Failed to update environment variable");
    },
  });

  // Delete environment variable
  const deleteVariable = useMutation({
    mutationFn: async ({
        env_type_id,
        projectNameId,
        key
      }: {
        env_type_id: string;
        projectNameId: string;
        key
    }) => {
      return await api.environmentVariables.deleteEnv({
        app_id: projectNameId,
        env_type_id: env_type_id,
        key
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-environments", projectNameId] });
      toast.success("Environment variable deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete environment variable:", error);
      toast.error("Failed to delete environment variable");
    },
  });

  // Bulk import environment variables
  const bulkImportVariables = useMutation({
    mutationFn: async (data: BulkEnvVarData) => {
      const promises = data.variables.map(variable =>
        api.environmentVariables.createEnv({
            key: variable.key,
            value: variable.value,
            env_type_id: data.env_type_id,
            app_id: projectNameId,
        })
      );
      
      return await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project-environments", projectNameId] });
      toast.success(`Successfully imported ${variables.variables.length} environment variables`);
    },
    onError: (error) => {
      console.error("Failed to import environment variables:", error);
      toast.error("Failed to import environment variables");
    },
  });

  return {
    // Data
    project: projectData?.project,
    environmentTypes: projectData?.environmentTypes || [],
    environmentVariables: projectData?.environmentVariables || [],
    isLoading,
    error,
    
    // Mutations
    createVariable,
    updateVariable,
    deleteVariable,
    bulkImportVariables,
    
    // Utility functions
    refetch,
  };
};

