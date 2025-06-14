import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Trash2, Upload } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateOrgRequest } from "@envsync-cloud/envsync-ts-sdk"

export const Settings = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    website: "",
    logo_url: null as string | null,
  });
  
  const { data: orgSettings, isLoading } = useQuery({
    queryKey: ["orgSettings"],
    queryFn: async () => {
      const data = await api.organizations.getOrg();
      setLogoPreview(data.logo_url || null);
      // Initialize form data with fetched values
      setFormData({
        name: data.name || "",
        contact_email: data.metadata?.contact_email || "",
        website: data.website || "",
        logo_url: data.logo_url || null,
      });
      return data;
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // upload the file to the server
      const fileData = await api.fileUpload.uploadFile({
        file,
      });

      // Update form data with the uploaded logo URL
      setFormData(prev => ({
        ...prev,
        logo_url: fileData.s3_url // Assuming the API returns the URL of the uploaded file
      }));

      console.log("Logo uploaded successfully:", fileData);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Mutation to update organization settings
  const updateOrgSettings = useMutation({
    mutationFn: async (settings: UpdateOrgRequest) => {
      return await api.organizations.updateOrg({
        name: settings.name,
        website: settings.website,
        logo_url: settings.logo_url,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch org settings
      queryClient.invalidateQueries({ queryKey: ["orgSettings"] });
      console.log("Organization settings updated successfully");
      // You can add a toast notification here
    },
    onError: (error) => {
      console.error("Failed to update organization settings:", error);
      // You can add error toast notification here
    },
  });

  // Mutation for deleting organization
  const deleteOrgMutation = useMutation({
    mutationFn: async () => {
      alert("Deleting organization...");
    },
    onSuccess: () => {
      console.log("Organization deleted successfully");
      // Redirect user or handle post-deletion logic
    },
    onError: (error) => {
      console.error("Failed to delete organization:", error);
    },
  });

  // Handle form submission
  const handleSaveChanges = () => {
    const updateData: UpdateOrgRequest = {
      name: formData.name,
      website: formData.website,
      logo_url: formData.logo_url || null, // Ensure logo_url is null if not set
    };

    updateOrgSettings.mutate(updateData);
  };

  // Handle organization deletion
  const handleDeleteOrg = () => {
    if (window.confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      deleteOrgMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Org Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your organization configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Org Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-white">
                Organization Name
              </Label>
              <Input
                id="full-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="slug" className="text-white">
                Slug
              </Label>
              <Input
                id="slug"
                defaultValue={orgSettings?.slug}
                className="bg-gray-900 border-gray-700 text-white"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Contact Email
              </Label>
              <Input
                id="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-white">
                Website
              </Label>
              <Input
                id="website"
                placeholder="Enter your organization website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Company Logo</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Company Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">Logo</span>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="text-white border-gray-600 hover:bg-gray-700" 
                    type="button"
                    onClick={triggerFileInput}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  {logoPreview && (
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white text-sm" 
                      type="button"
                      onClick={() => setLogoPreview(null)}
                    >
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
              <p className="text-xs text-gray-400">
                Recommended: Square image, max 5MB (PNG, JPG, GIF)
              </p>
            </div>
            <Button 
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              onClick={handleSaveChanges}
              disabled={updateOrgSettings.isPending}
            >
              {updateOrgSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-red-900 border">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Delete Org</h4>
              <p className="text-sm text-gray-400">
                Permanently delete your organization and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteOrg}
              disabled={deleteOrgMutation.isPending}
            >
              {deleteOrgMutation.isPending ? "Deleting..." : "Delete Org"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
