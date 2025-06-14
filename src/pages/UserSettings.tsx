import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { UpdateUserRequest } from "@envsync-cloud/envsync-ts-sdk";

export const UserSettings = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
      name: "",
      email: "",
      profile_picture_url: "",
    }
  );

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const {
        user: userData
      } = await api.authentication.whoami();
      if (userData) {
        setFormData({
          name: userData.full_name || "",
          email: userData.email || "",
          profile_picture_url: userData.profile_picture_url || "",
        });

        if (userData.profile_picture_url) {
          setLogoPreview(userData.profile_picture_url);
        } else {
          setLogoPreview(null);
        }
      }
      return userData;
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

  // Mutation to update user settings
  const updateUserSettings = useMutation({
    mutationFn: async (settings: UpdateUserRequest) => {
      return await api.users.updateUser(userData.id, {
        full_name: settings.full_name,
        email: settings.email,
        profile_picture_url: settings.profile_picture_url,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch user info
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      console.log("User settings updated successfully");
      // You can add a toast notification here
    },
    onError: (error) => {
      console.error("Failed to update user settings:", error);
      // You can add error toast notification here
    },
  });

  // Mutation for deleting organization
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      alert("Deleting user...");
    },
    onSuccess: () => {
      console.log("User deleted successfully");
      // Redirect user or handle post-deletion logic
    },
    onError: (error) => {
      console.error("Failed to delete user:", error);
    },
  });

  // Mutation to reset password
  const resetPasswordMutation = useMutation({
    mutationFn: async (
      { userId }: { userId: string }
    ) => {
      // Logic to reset password
      return await api.users.updatePassword(userId);
    },
    onSuccess: () => {
      console.log("Password reset successfully");
      // You can add a toast notification here
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
      // You can add error toast notification here
    },
  });

  // Handle form submission
  const handleSaveChanges = () => {
    const updateData: UpdateUserRequest = {
      full_name: formData.name,
      email: formData.email,
      profile_picture_url: formData.profile_picture_url || null,
    };

    updateUserSettings.mutate(updateData);
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate();
    }
  };

  const handleResetPassword = () => {
    if (window.confirm("Are you sure you want to reset the password?")) {
      resetPasswordMutation.mutate(
        { userId: userData.id }
      );
    }
  }

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
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your account configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-white">
                Full Name
              </Label>
              <Input
                id="full-name"
                defaultValue=""
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                defaultValue=""
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Profile Picture</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="User Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">Profile Picture</span>
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
              disabled={updateUserSettings.isPending}
            >
              {updateUserSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Misc</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Email Notifications</h4>
                <p className="text-sm text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                  disabled
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric_indigo-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Change Password</h4>
                <p className="text-sm text-gray-400">
                  Update your account password
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <Button
                  variant="outline"
                  className="text-white border-gray-600 hover:bg-gray-700"
                  onClick={() => handleResetPassword()}
                >
                  Reset Password
                </Button>
              </label>
            </div>
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
              <h4 className="font-medium text-white">Delete Account</h4>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
