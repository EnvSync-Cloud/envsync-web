import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trash2, Upload, X, AlertTriangle } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateOrgRequest } from "@envsync-cloud/envsync-ts-sdk";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormData {
  name: string;
  contact_email: string;
  website: string;
  logo_url: string | null;
}

interface FormErrors {
  name?: string;
  contact_email?: string;
  website?: string;
  logo_url?: string;
}

export const Settings = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact_email: "",
    website: "",
    logo_url: null,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch organization settings
  const { data: orgSettings, isLoading, error } = useQuery({
    queryKey: ["orgSettings"],
    queryFn: async () => {
      const data = await api.organizations.getOrg();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Initialize form data when org settings are loaded
  useEffect(() => {
    if (orgSettings) {
      const initialData = {
        name: orgSettings.name || "",
        contact_email: orgSettings.metadata?.contact_email || "",
        website: orgSettings.website || "",
        logo_url: orgSettings.logo_url || null,
      };
      
      setFormData(initialData);
      setLogoPreview(orgSettings.logo_url || null);
      setHasUnsavedChanges(false);
    }
  }, [orgSettings]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Organization name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Organization name must be at least 2 characters";
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = "Please enter a valid email address";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = "Please enter a valid website URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Handle logo upload
  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, logo_url: 'Please select an image file' }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, logo_url: 'File size must be less than 5MB' }));
      return;
    }

    // Clear any previous logo errors
    setFormErrors(prev => ({ ...prev, logo_url: undefined }));

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const fileData = await api.fileUpload.uploadFile({ file });

      // Update form data
      setFormData(prev => ({
        ...prev,
        logo_url: fileData.s3_url
      }));
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Logo upload failed:", error);
      setFormErrors(prev => ({ ...prev, logo_url: 'Failed to upload logo. Please try again.' }));
      setLogoPreview(formData.logo_url); // Reset preview
    }
  }, [api.fileUpload, formData.logo_url]);

  // Handle logo removal
  const handleLogoRemove = useCallback(() => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo_url: null }));
    setHasUnsavedChanges(true);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Mutation to update organization settings
  const updateOrgSettings = useMutation({
    mutationFn: async (settings: UpdateOrgRequest) => {
      return await api.organizations.updateOrg(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgSettings"] });
      setHasUnsavedChanges(false);
      // You can add a success toast notification here
      console.log("Organization settings updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update organization settings:", error);
      // You can add error toast notification here
    },
  });

  // Mutation for deleting organization
  const deleteOrgMutation = useMutation({
    mutationFn: async () => {
      // Replace with actual delete API call
      console.log("Organization deletion API called");
    },
    onSuccess: () => {
      console.log("Organization deleted successfully");
      // Redirect to appropriate page after deletion
      window.location.href = '/';
    },
    onError: (error) => {
      console.error("Failed to delete organization:", error);
    },
  });

  // Handle form submission
  const handleSaveChanges = useCallback(() => {
    if (!validateForm()) return;

    const updateData: UpdateOrgRequest = {
      name: formData.name.trim(),
      website: formData.website.trim() || null,
      logo_url: formData.logo_url,
      // Note: contact_email might need to be handled differently based on your API
      // You may need to update the SDK type definition or handle it separately
    };

    updateOrgSettings.mutate(updateData);
  }, [formData, validateForm, updateOrgSettings]);

  // Handle organization deletion
  const handleDeleteOrg = useCallback(() => {
    if (deleteConfirmText !== orgSettings?.name) {
      return;
    }
    
    deleteOrgMutation.mutate();
    setIsDeleteDialogOpen(false);
  }, [deleteConfirmText, orgSettings?.name, deleteOrgMutation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading organization settings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-500 text-xl">⚠️</div>
          <p className="text-gray-400">Failed to load organization settings</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["orgSettings"] })}
            className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Organization Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your organization configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-electric_indigo-500" />
                <CardTitle className="text-white">Organization Information</CardTitle>
              </div>
              {hasUnsavedChanges && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  Unsaved changes
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-white">
                Organization Name *
              </Label>
              <Input
                id="org-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.name ? 'border-red-500' : ''
                }`}
                placeholder="Enter organization name"
              />
              {formErrors.name && (
                <p className="text-red-400 text-sm">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white">
                Slug
              </Label>
              <Input
                id="slug"
                value={orgSettings?.slug || ''}
                className="bg-gray-900 border-gray-700 text-gray-400"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-400">
                Organization slug cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email" className="text-white">
                Contact Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.contact_email ? 'border-red-500' : ''
                }`}
                placeholder="contact@yourorg.com"
              />
              {formErrors.contact_email && (
                <p className="text-red-400 text-sm">{formErrors.contact_email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-white">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.website ? 'border-red-500' : ''
                }`}
                placeholder="https://yourorg.com"
              />
              {formErrors.website && (
                <p className="text-red-400 text-sm">{formErrors.website}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Company Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Company Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">Logo</span>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="text-white border-gray-600 hover:bg-gray-700" 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateOrgSettings.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  {logoPreview && (
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white text-sm" 
                      type="button"
                      onClick={handleLogoRemove}
                      disabled={updateOrgSettings.isPending}
                    >
                                            <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              {formErrors.logo_url && (
                <p className="text-red-400 text-sm">{formErrors.logo_url}</p>
              )}
              <p className="text-xs text-gray-400">
                Recommended: Square image, max 5MB (PNG, JPG, GIF)
              </p>
            </div>

            <Button 
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              onClick={handleSaveChanges}
              disabled={updateOrgSettings.isPending || !hasUnsavedChanges}
            >
              {updateOrgSettings.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Organization Stats Card */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Organization Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {orgSettings?.created_at ? 
                    Math.floor((Date.now() - new Date(orgSettings.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-400">Days Active</div>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {orgSettings?.id ? orgSettings.id.substring(0, 8) : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Org ID</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Created</Label>
              <div className="text-sm text-gray-400">
                {orgSettings?.created_at ? 
                  new Date(orgSettings.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  : 'Unknown'
                }
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Last Updated</Label>
              <div className="text-sm text-gray-400">
                {orgSettings?.updated_at ? 
                  new Date(orgSettings.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  : 'Unknown'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-gray-800 border-red-900 border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Delete Organization</h4>
              <p className="text-sm text-gray-400">
                Permanently delete your organization and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={deleteOrgMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Organization
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Delete Organization
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your organization,
              all projects, environments, and associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-200">
                  <p className="font-medium mb-1">This will delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-300">
                    <li>All projects and environments</li>
                    <li>All environment variables and secrets</li>
                    <li>All API keys and access tokens</li>
                    <li>All team members and permissions</li>
                    <li>All audit logs and history</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-white">
                Type <code className="bg-gray-700 px-1 rounded text-red-400">{orgSettings?.name}</code> to confirm:
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter organization name"
                disabled={deleteOrgMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmText("");
              }}
              className="text-white border-gray-600 hover:bg-gray-700"
              disabled={deleteOrgMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrg}
              disabled={deleteConfirmText !== orgSettings?.name || deleteOrgMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteOrgMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Organization
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;

