import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, FolderPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateProjectFormData {
  name: string;
  description: string;
}

interface CreateProjectFormErrors {
  name?: string;
  description?: string;
}

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-_\s]*[a-zA-Z0-9]$/;

export const CreateProject = () => {
  const navigate = useNavigate();
  const { api } = useAuth();

  // Form state
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<CreateProjectFormErrors>({});

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: CreateProjectFormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Project name must be at least 2 characters";
    } else if (formData.name.length > MAX_NAME_LENGTH) {
      errors.name = `Project name must be less than ${MAX_NAME_LENGTH} characters`;
    } else if (!PROJECT_NAME_REGEX.test(formData.name.trim())) {
      errors.name = "Project name can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    // Validate description
    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof CreateProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      return await api.applications.createApp({
        name: data.name.trim(),
        description: data.description.trim() || undefined,
      });
    },
    onSuccess: (response) => {
      toast.success("Project created successfully!");
      navigate(`/projects/${response.id}`);
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
    },
  });

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || createProject.isPending) return;
    
    createProject.mutate(formData);
  }, [formData, validateForm, createProject]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Project</h1>
          <p className="text-slate-400 mt-2">
            Set up a new project to manage your environment variables
          </p>
        </div>
      </div>

      {/* Create Project Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FolderPlus className="w-5 h-5 mr-2 text-emerald-500" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-white">
                Project Name *
              </Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`bg-slate-900 border-slate-700 text-white ${
                  formErrors.name ? 'border-red-500' : ''
                }`}
                placeholder="Enter project name"
                disabled={createProject.isPending}
                maxLength={MAX_NAME_LENGTH}
              />
              {formErrors.name && (
                <p className="text-red-400 text-sm">{formErrors.name}</p>
              )}
              <div className="flex justify-between text-xs text-slate-400">
                <span>Use a descriptive name for your project</span>
                <span>{formData.name.length}/{MAX_NAME_LENGTH}</span>
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-white">
                Description (Optional)
              </Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={`bg-slate-900 border-slate-700 text-white min-h-[100px] ${
                  formErrors.description ? 'border-red-500' : ''
                }`}
                placeholder="Describe what this project is for..."
                disabled={createProject.isPending}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              {formErrors.description && (
                <p className="text-red-400 text-sm">{formErrors.description}</p>
              )}
              <div className="flex justify-between text-xs text-slate-400">
                <span>Optional description to help identify this project</span>
                <span>{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
              </div>
            </div>

            {/* Project Preview */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-medium text-white mb-3">Project Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Name:</span>
                  <span className="text-sm text-emerald-400 font-medium">
                    {formData.name || "Project Name"}
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-xs text-slate-500 mt-0.5">Description:</span>
                  <span className="text-sm text-slate-300">
                    {formData.description || "No description provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="text-white border-slate-600 hover:bg-slate-700"
                disabled={createProject.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={createProject.isPending || !formData.name.trim()}
              >
                {createProject.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <h4 className="text-sm font-medium text-white mb-3">What happens next?</h4>
          <div className="space-y-2 text-sm text-slate-400">
            <p>• Your project will be created and ready to use</p>
            <p>• You can start adding environment variables for different environments</p>
            <p>• Team members can be given access to manage the project</p>
            <p>• You can integrate with your deployment pipeline using our CLI or API</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProject;
