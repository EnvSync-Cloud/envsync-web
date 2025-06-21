import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectEnvironmentsHeader } from "@/components/env-vars/ProjectEnvironmentsHeader";
import { EnvironmentVariablesTable } from "@/components/env-vars/EnvironmentVariablesTable";
import { AddEnvVarModal } from "@/components/env-vars/AddEnvVarModal";
import { EditEnvVarModal } from "@/components/env-vars/EditEnvVarModal";
import { DeleteEnvVarModal } from "@/components/env-vars/DeleteEnvVarModal";
import { BulkImportModal } from "@/components/env-vars/BulkImportModal";
import { ProjectEnvironmentsLoadingPage } from "./loading";
import { ProjectEnvironmentsErrorPage } from "./error";
import { useProjectEnvironments } from "@/hooks/useProjectEnvironments";
import { 
  EnvironmentVariable, 
  EnvVarFormData, 
  BulkEnvVarData 
} from "@/api/constants";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";

export const ProjectEnvironments = () => {
    const { user } = useAuth();
    const { projectNameId } = useParams();
    const navigate = useNavigate();
    

    const onBack = useCallback(() => {
        window.history.back();
    }, []);

  const {
    // Data
    project,
    environmentTypes,
    environmentVariables,
    isLoading,
    error,
    
    // Mutations
    createVariable,
    updateVariable,
    deleteVariable,
    bulkImportVariables,
    
    // Utility functions
    refetch,
  } = useProjectEnvironments(projectNameId);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<EnvironmentVariable | null>(null);

  // Event handlers
  const handleAddVariable = useCallback((data: EnvVarFormData) => {
    createVariable.mutate(data, {
      onSuccess: () => {
        setShowAddModal(false);
      }
    });
  }, [createVariable]);

  const handleEditVariable = useCallback((variableId: string, data: Partial<EnvVarFormData>) => {
    updateVariable.mutate({ variableId, data }, {
      onSuccess: () => {
        setShowEditModal(false);
        setSelectedVariable(null);
      }
    });
  }, [updateVariable]);

  const handleDeleteVariable = useCallback((
    env_type_id: string,
    key: string,
    projectNameId: string
  ) => {
    deleteVariable.mutate({
        env_type_id,
        key,
        projectNameId
    }, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setSelectedVariable(null);
      }
    });
  }, [deleteVariable]);

  const handleBulkImport = useCallback((data: BulkEnvVarData) => {
    bulkImportVariables.mutate(data, {
      onSuccess: () => {
        setShowBulkImportModal(false);
      }
    });
  }, [bulkImportVariables]);

  const handleEditClick = useCallback((variable: EnvironmentVariable) => {
    setSelectedVariable(variable);
    setShowEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((variable: EnvironmentVariable) => {
    setSelectedVariable(variable);
    setShowDeleteModal(true);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Loading user data ...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProjectEnvironmentsLoadingPage />;
  }

  if (error) {
    return <ProjectEnvironmentsErrorPage error={error} onRetry={handleRetry} onBack={onBack} />;
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Project not found</h3>
          <p className="text-slate-400 mb-4">The requested project could not be found.</p>
          <Button onClick={onBack} variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProjectEnvironmentsHeader
        environmentTypes={environmentTypes.length}
        isRefetching={createVariable.isPending || updateVariable.isPending || deleteVariable.isPending || bulkImportVariables.isPending}
        projectName={project.name}
        totalSecrets={0}
        totalVariables={environmentVariables.length}
        onBack={onBack}
        onAddVariable={() => setShowAddModal(true)}
        onBulkImport={() => setShowBulkImportModal(true)}
        canEdit={user.role.can_edit}
        onExport={() => console.log("Export functionality not implemented yet")}
        onRefresh={handleRetry}
        onManageEnvironments={() => {
            navigate(`/projects/${projectNameId}/manage-environments`);
        }}
      />

      {/* Environment Variables Table */}
      <EnvironmentVariablesTable
        variables={environmentVariables}
        environmentTypes={environmentTypes}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        canEdit={user.role.can_edit}        
      />

      {/* Add Variable Modal */}
      <AddEnvVarModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        environmentTypes={environmentTypes}
        onSave={handleAddVariable}
        isSaving={createVariable.isPending}
      />

      {/* Edit Variable Modal */}
      <EditEnvVarModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        variable={selectedVariable}
        environmentTypes={environmentTypes}
        onSave={handleEditVariable}
        isSaving={updateVariable.isPending}
      />

      {/* Delete Variable Modal */}
      <DeleteEnvVarModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        variable={selectedVariable}
        environmentTypes={environmentTypes}
        onDelete={handleDeleteVariable}
        isDeleting={deleteVariable.isPending}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={showBulkImportModal}
        onOpenChange={setShowBulkImportModal}
        environmentTypes={environmentTypes}
        onImport={handleBulkImport}
        isImporting={bulkImportVariables.isPending}
      />
    </div>
  );
};

export default ProjectEnvironments;
