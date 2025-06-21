import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Shield, Key, Save } from "lucide-react";
import { 
  EnvVarFormData, 
  EnvVarFormErrors, 
  EnvironmentVariable,
  EnvironmentType,
  ENV_VAR_KEY_REGEX,
  MAX_KEY_LENGTH,
  MAX_VALUE_LENGTH,
  INITIAL_ENV_FORM_ERRORS
} from "@/api/constants";

interface EditEnvVarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable: EnvironmentVariable | null;
  environmentTypes: EnvironmentType[];
  onSave: (variableId: string, data: Partial<EnvVarFormData>) => void;
  isSaving: boolean;
}

export const EditEnvVarModal = ({
  open,
  onOpenChange,
  variable,
  environmentTypes,
  onSave,
  isSaving,
}: EditEnvVarModalProps) => {
  const [formData, setFormData] = useState<EnvVarFormData>({
    key: "",
    value: "",
    sensitive: false,
    env_type_id: "",
  });
  const [formErrors, setFormErrors] = useState<EnvVarFormErrors>(INITIAL_ENV_FORM_ERRORS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form when variable changes
  useEffect(() => {
    if (variable && open) {
      const initialData = {
        key: variable.key,
        value: variable.value,
        sensitive: variable.sensitive,
        env_type_id: variable.env_type_id,
      };
      setFormData(initialData);
      setFormErrors(INITIAL_ENV_FORM_ERRORS);
      setHasUnsavedChanges(false);
    }
  }, [variable, open]);

  // Check for unsaved changes
  useEffect(() => {
    if (!variable) return;
    
    const hasChanges = 
      formData.key !== variable.key ||
      formData.value !== variable.value ||
      formData.sensitive !== variable.sensitive ||
      formData.env_type_id !== variable.env_type_id;
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, variable]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: EnvVarFormErrors = {};

    // Validate key
    if (!formData.key.trim()) {
      errors.key = "Variable key is required";
    } else if (!ENV_VAR_KEY_REGEX.test(formData.key)) {
      errors.key = "Key must start with a letter and contain only uppercase letters, numbers, and underscores";
    } else if (formData.key.length > MAX_KEY_LENGTH) {
      errors.key = `Key must be less than ${MAX_KEY_LENGTH} characters`;
    }

    // Validate value
    if (!formData.value.trim()) {
      errors.value = "Variable value is required";
    } else if (formData.value.length > MAX_VALUE_LENGTH) {
      errors.value = `Value must be less than ${MAX_VALUE_LENGTH} characters`;
    }

    // Validate environment type
    if (!formData.env_type_id) {
      errors.env_type_id = "Environment type is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof EnvVarFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field as keyof EnvVarFormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Handle form submission
  const handleSave = useCallback(() => {
    if (!variable || !validateForm() || isSaving) return;

    const updateData: Partial<EnvVarFormData> = {};
    
    // Only include changed fields
    if (formData.key !== variable.key) {
      updateData.key = formData.key.trim().toUpperCase();
    }
    if (formData.value !== variable.value) {
      updateData.value = formData.value.trim();
    }
    if (formData.sensitive !== variable.sensitive) {
      updateData.sensitive = formData.sensitive;
    }
    if (formData.env_type_id !== variable.env_type_id) {
      updateData.env_type_id = formData.env_type_id;
    }

    onSave(variable.id, updateData);
  }, [variable, formData, validateForm, isSaving, onSave]);

  // Handle modal close
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!variable) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Edit className="w-5 h-5 text-emerald-500 mr-2" />
            Edit Environment Variable
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the environment variable details. Changes will be applied immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Environment Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="edit-env-type" className="text-white">
              Environment Type *
            </Label>
            <Select
              value={formData.env_type_id}
              onValueChange={(value) => handleInputChange("env_type_id", value)}
              disabled={isSaving}
            >
              <SelectTrigger className={`bg-slate-900 border-slate-700 text-white ${
                formErrors.env_type_id ? 'border-red-500' : ''
              }`}>
                <SelectValue placeholder="Select environment type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {environmentTypes.map((envType) => (
                  <SelectItem key={envType.id} value={envType.id} className="text-white hover:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: envType.color }}
                      />
                      <span>{envType.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.env_type_id && (
              <p className="text-red-400 text-sm">{formErrors.env_type_id}</p>
            )}
          </div>

          {/* Variable Key */}
          <div className="space-y-2">
            <Label htmlFor="edit-var-key" className="text-white">
              Variable Key *
            </Label>
            <Input
              id="edit-var-key"
              value={formData.key}
              onChange={(e) => handleInputChange("key", e.target.value.toUpperCase())}
              className={`bg-slate-900 border-slate-700 text-white font-mono ${
                formErrors.key ? 'border-red-500' : ''
              }`}
              placeholder="DATABASE_URL"
              disabled={isSaving}
              maxLength={MAX_KEY_LENGTH}
            />
            {formErrors.key && (
              <p className="text-red-400 text-sm">{formErrors.key}</p>
            )}
            <p className="text-xs text-slate-400">
              Must start with a letter and contain only uppercase letters, numbers, and underscores
            </p>
          </div>

          {/* Variable Value */}
          <div className="space-y-2">
            <Label htmlFor="edit-var-value" className="text-white">
              Variable Value *
            </Label>
            <Textarea
              id="edit-var-value"
              value={formData.value}
              onChange={(e) => handleInputChange("value", e.target.value)}
              className={`bg-slate-900 border-slate-700 text-white font-mono min-h-[100px] ${
                formErrors.value ? 'border-red-500' : ''
              }`}
              placeholder="Enter the variable value..."
              disabled={isSaving}
              maxLength={MAX_VALUE_LENGTH}
            />
            {formErrors.value && (
              <p className="text-red-400 text-sm">{formErrors.value}</p>
            )}
            <div className="flex justify-between text-xs text-slate-400">
              <span>Value will be stored securely</span>
              <span>{formData.value.length}/{MAX_VALUE_LENGTH}</span>
            </div>
          </div>

          {/* Sensitive Checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
            <Checkbox
              id="edit-sensitive"
              checked={formData.sensitive}
              onCheckedChange={(checked) => handleInputChange("sensitive", checked as boolean)}
              disabled={isSaving}
              className="border-slate-600"
            />
            <div className="flex-1">
              <Label htmlFor="edit-sensitive" className="text-white flex items-center cursor-pointer">
                {formData.sensitive ? (
                  <Shield className="w-4 h-4 text-red-400 mr-2" />
                ) : (
                  <Key className="w-4 h-4 text-slate-400 mr-2" />
                )}
                Mark as sensitive (secret)
              </Label>
              <p className="text-xs text-slate-400 mt-1">
                {formData.sensitive 
                  ? "This value will be encrypted and hidden by default"
                  : "This value will be visible to team members with access"
                }
              </p>
            </div>
          </div>

          {/* Changes Summary */}
          {hasUnsavedChanges && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Pending Changes</h4>
              <div className="space-y-1 text-xs text-yellow-300">
                {formData.key !== variable.key && (
                  <div>• Key: {variable.key} → {formData.key}</div>
                )}
                {formData.value !== variable.value && (
                  <div>• Value: Updated</div>
                )}
                {formData.sensitive !== variable.sensitive && (
                  <div>• Type: {variable.sensitive ? "Secret" : "Variable"} → {formData.sensitive ? "Secret" : "Variable"}</div>
                )}
                {formData.env_type_id !== variable.env_type_id && (
                  <div>• Environment: Changed</div>
                )}
              </div>
            </div>
          )}

          {/* Current vs New Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Current</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Key:</span>
                  <code className="text-sm font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {variable.key}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Type:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    variable.sensitive 
                      ? "bg-red-900/20 text-red-400" 
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {variable.sensitive ? "Secret" : "Variable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-medium text-white mb-2">New</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Key:</span>
                  <code className="text-sm font-mono text-emerald-400 bg-slate-800 px-2 py-1 rounded">
                    {formData.key || "VARIABLE_KEY"}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Type:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    formData.sensitive 
                      ? "bg-red-900/20 text-red-400" 
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {formData.sensitive ? "Secret" : "Variable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-white border-slate-600 hover:bg-slate-700"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={isSaving || !hasUnsavedChanges || !formData.key || !formData.value || !formData.env_type_id}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
