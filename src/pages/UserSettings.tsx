import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Trash2, Upload, X, AlertTriangle, Key } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useCallback, useEffect } from "react";
import { UpdateUserRequest } from "@envsync-cloud/envsync-ts-sdk";
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
  email: string;
  profile_picture_url: string | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  profile_picture_url?: string;
}

export const UserSettings = () => {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    profile_picture_url: null,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Dialog states
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Fetch user data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const { user: userData } = await api.authentication.whoami();
      return userData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userData) {
      const initialData = {
        name: userData.full_name || "",
        email: userData.email || "",
        profile_picture_url: userData.profile_picture_url || null,
      };
      
      setFormData(initialData);
      setLogoPreview(userData.profile_picture_url || null);
      setHasUnsavedChanges(false);
    }
  }, [userData]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle profile picture upload
  const handleLogoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, profile_picture_url: 'Please select an image file' }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, profile_picture_url: 'File size must be less than 5MB' }));
      return;
    }

    // Clear any previous errors
    setFormErrors(prev => ({ ...prev, profile_picture_url: undefined }));

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
        profile_picture_url: fileData.s3_url
      }));
      
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      setFormErrors(prev => ({ 
        ...prev, 
        profile_picture_url: 'Failed to upload profile picture. Please try again.' 
      }));
      setLogoPreview(formData.profile_picture_url); // Reset preview
    }
  }, [api.fileUpload, formData.profile_picture_url]);

  // Handle profile picture removal
  const handleLogoRemove = useCallback(() => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, profile_picture_url: null }));
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

  // Mutation to update user settings
  const updateUserSettings = useMutation({
    mutationFn: async (settings: UpdateUserRequest) => {
      if (!userData?.id) throw new Error("User ID not found");
      return await api.users.updateUser(userData.id, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      setHasUnsavedChanges(false);
      console.log("User settings updated successfully");
      // You can add a success toast notification here
    },
    onError: (error) => {
      console.error("Failed to update user settings:", error);
      // You can add error toast notification here
    },
  });

  // Mutation to reset password
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!userData?.id) throw new Error("User ID not found");
      return await api.users.updatePassword(userData.id);
    },
    onSuccess: () => {
      console.log("Password reset successfully");
      setIsPasswordResetDialogOpen(false);
      // You can add a success toast notification here
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
      // You can add error toast notification here
    },
  });

  // Mutation for deleting user account
  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!userData?.id) throw new Error("User ID not found");
      // Replace with actual delete API call when available
      return await api.users.deleteUser(userData.id);
    },
    onSuccess: () => {
      console.log("User account deleted successfully");
      // Redirect to login or home page
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error("Failed to delete user account:", error);
      // You can add error toast notification here
    },
  });

  // Handle form submission
  const handleSaveChanges = useCallback(() => {
    if (!validateForm()) return;

    const updateData: UpdateUserRequest = {
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      profile_picture_url: formData.profile_picture_url,
    };

    updateUserSettings.mutate(updateData);
  }, [formData, validateForm, updateUserSettings]);

  // Handle password reset
  const handleResetPassword = useCallback(() => {
    resetPasswordMutation.mutate();
  }, [resetPasswordMutation]);

  // Handle account deletion
  const handleDeleteUser = useCallback(() => {
    if (deleteConfirmText !== userData?.email) {
      return;
    }
    
    deleteUserMutation.mutate();
    setIsDeleteAccountDialogOpen(false);
  }, [deleteConfirmText, userData?.email, deleteUserMutation]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-12 border-4 border-t-electric_indigo-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your profile...</p>
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
          <p className="text-gray-400">Failed to load user settings</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["userInfo"] })}
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
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-2">
          Manage your account configuration and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-electric_indigo-500" />
                <CardTitle className="text-white">Profile Information</CardTitle>
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
              <Label htmlFor="full-name" className="text-white">
                Full Name *
              </Label>
              <Input
                id="full-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.name ? 'border-red-500' : ''
                }`}
                placeholder="Enter your full name"
              />
              {formErrors.name && (
                <p className="text-red-400 text-sm">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`bg-gray-900 border-gray-700 text-white ${
                  formErrors.email ? 'border-red-500' : ''
                }`}
                placeholder="Enter your email address"
              />
              {formErrors.email && (
                <p className="text-red-400 text-sm">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Profile Picture</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-600">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Profile Picture Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="text-white border-gray-600 hover:bg-gray-700" 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateUserSettings.isPending}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Picture
                  </Button>
                  {logoPreview && (
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white text-sm" 
                      type="button"
                      onClick={handleLogoRemove}
                      disabled={updateUserSettings.isPending}
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
              {formErrors.profile_picture_url && (
                <p className="text-red-400 text-sm">{formErrors.profile_picture_url}</p>
              )}
              <p className="text-xs text-gray-400">
                Recommended: Square image, max 5MB (PNG, JPG, GIF)
              </p>
            </div>

            <Button 
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              onClick={handleSaveChanges}
              disabled={updateUserSettings.isPending || !hasUnsavedChanges}
            >
              {updateUserSettings.isPending ? (
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

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Account Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Email Notifications</h4>
                <p className="text-sm text-gray-400">
                  Receive updates and alerts via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric_indigo-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Change Password</h4>
                <p className="text-sm text-gray-400">
                  Update your account password for security
                </p>
              </div>
              <Button
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
                onClick={() => setIsPasswordResetDialogOpen(true)}
                disabled={resetPasswordMutation.isPending}
              >
                <Key className="w-4 h-4 mr-2" />
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </div>

            {/* Account Stats */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium text-white mb-3">Account Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-lg font-bold text-white">
                    {userData?.created_at ? 
                      Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
                      : 0
                    }
                  </div>
                  <div className="text-xs text-gray-400">Days Active</div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <div className="text-lg font-bold text-white">
                    {userData?.id ? userData.id.substring(0, 8) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">User ID</div>
                </div>
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
              <h4 className="font-medium text-white">Delete Account</h4>
              <p className="text-sm text-gray-400">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setIsDeleteAccountDialogOpen(true)}
              disabled={deleteUserMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Key className="w-5 h-5 text-electric_indigo-500 mr-2" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              A password reset link will be sent to your email address. You'll need to check your email 
              and follow the instructions to set a new password.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Key className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  <p className="font-medium mb-1">What happens next:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-300">
                    <li>Password reset email sent to: <strong>{userData?.email}</strong></li>
                    <li>Check your inbox and spam folder</li>
                    <li>Click the reset link in the email</li>
                    <li>Set your new password</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordResetDialogOpen(false)}
              className="text-white border-gray-600 hover:bg-gray-700"
              disabled={resetPasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Send Reset Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-200">
                  <p className="font-medium mb-1">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-300">
                    <li>Your user profile and settings</li>
                    <li>All your personal data</li>
                    <li>Access to all organizations you're a member of</li>
                    <li>All your API keys and tokens</li>
                    <li>Your account history and activity logs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-white">
                Type <code className="bg-gray-700 px-1 rounded text-red-400">{userData?.email}</code> to confirm:
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter your email address"
                disabled={deleteUserMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAccountDialogOpen(false);
                setDeleteConfirmText("");
              }}
              className="text-white border-gray-600 hover:bg-gray-700"
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteConfirmText !== userData?.email || deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings;
