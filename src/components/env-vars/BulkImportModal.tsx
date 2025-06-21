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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Shield,
  Key,
  Info
} from "lucide-react";
import { 
  BulkEnvVarData, 
  EnvironmentType,
  BULK_IMPORT_EXAMPLE,
  ENV_VAR_KEY_REGEX,
  MAX_KEY_LENGTH,
  MAX_VALUE_LENGTH
} from "@/api/constants";

interface ParsedVariable {
  key: string;
  value: string;
  sensitive: boolean;
  line: number;
  valid: boolean;
  error?: string;
}

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentTypes: EnvironmentType[];
  onImport: (data: BulkEnvVarData) => void;
  isImporting: boolean;
}

export const BulkImportModal = ({
  open,
  onOpenChange,
  environmentTypes,
  onImport,
  isImporting,
}: BulkImportModalProps) => {
  const [selectedEnvType, setSelectedEnvType] = useState("");
  const [importText, setImportText] = useState("");
  const [parsedVariables, setParsedVariables] = useState<ParsedVariable[]>([]);
  const [activeTab, setActiveTab] = useState("input");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedEnvType("");
      setImportText("");
      setParsedVariables([]);
      setActiveTab("input");
    }
  }, [open]);

  // Parse variables when import text changes
  useEffect(() => {
    if (!importText.trim()) {
      setParsedVariables([]);
      return;
    }

    const lines = importText.split('\n');
    const parsed: ParsedVariable[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        parsed.push({
          key: trimmedLine,
          value: "",
          sensitive: false,
          line: index + 1,
          valid: false,
          error: "Missing '=' separator"
        });
        return;
      }

      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();

      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');

      // Validate key
      let error: string | undefined;
      let valid = true;

      if (!key) {
        error = "Key is required";
        valid = false;
      } else if (!ENV_VAR_KEY_REGEX.test(key)) {
        error = "Invalid key format";
        valid = false;
      } else if (key.length > MAX_KEY_LENGTH) {
        error = `Key too long (max ${MAX_KEY_LENGTH} chars)`;
        valid = false;
      } else if (!cleanValue) {
        error = "Value is required";
        valid = false;
      } else if (cleanValue.length > MAX_VALUE_LENGTH) {
        error = `Value too long (max ${MAX_VALUE_LENGTH} chars)`;
        valid = false;
      }

      // Determine if sensitive (common secret patterns)
      const sensitivePatterns = [
        /secret/i, /password/i, /token/i, /key/i, /auth/i, 
        /credential/i, /private/i, /jwt/i, /api_key/i
      ];
      const sensitive = sensitivePatterns.some(pattern => pattern.test(key));

      parsed.push({
        key: key.toUpperCase(),
        value: cleanValue,
        sensitive,
        line: index + 1,
        valid,
        error
      });
    });

    setParsedVariables(parsed);
  }, [importText]);

  // Handle import
  const handleImport = useCallback(() => {
    if (!selectedEnvType || isImporting) return;

    const validVariables = parsedVariables.filter(v => v.valid);
    if (validVariables.length === 0) return;

    const importData: BulkEnvVarData = {
      env_type_id: selectedEnvType,
      variables: validVariables.map(v => ({
        key: v.key,
        value: v.value,
        sensitive: v.sensitive
      }))
    };

    onImport(importData);
  }, [selectedEnvType, parsedVariables, isImporting, onImport]);

  // Handle modal close
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Load example
  const handleLoadExample = useCallback(() => {
    setImportText(BULK_IMPORT_EXAMPLE);
    setActiveTab("preview");
  }, []);

  const validVariables = parsedVariables.filter(v => v.valid);
  const invalidVariables = parsedVariables.filter(v => !v.valid);
  const canImport = selectedEnvType && validVariables.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Upload className="w-5 h-5 text-emerald-500 mr-2" />
            Bulk Import Environment Variables
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Import multiple environment variables at once using key=value format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Environment Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="bulk-env-type" className="text-white">
              Target Environment *
            </Label>
            <Select
              value={selectedEnvType}
              onValueChange={setSelectedEnvType}
              disabled={isImporting}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
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
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900">
              <TabsTrigger value="input" className="text-slate-400 data-[state=active]:text-white">
                Input
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-slate-400 data-[state=active]:text-white">
                Preview ({parsedVariables.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="import-text" className="text-white">
                    Environment Variables
                  </Label>
                  <Button
                    onClick={handleLoadExample}
                    variant="ghost"
                    size="sm"
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Load Example
                  </Button>
                </div>
                <Textarea
                  id="import-text"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white font-mono min-h-[300px]"
                  placeholder={`# Enter your environment variables in KEY=value format
# Lines starting with # are comments

DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=your-secret-api-key
DEBUG=true
PORT=3000`}
                  disabled={isImporting}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Use KEY=value format, one per line</span>
                  <span>{importText.split('\n').length} lines</span>
                </div>
              </div>

              {/* Format Help */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium mb-2">Format Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>Use <code className="bg-slate-800 px-1 rounded">KEY=value</code> format</li>
                      <li>Keys must be uppercase with underscores (A-Z, 0-9, _)</li>
                      <li>Lines starting with # are treated as comments</li>
                      <li>Values with spaces can be quoted: <code className="bg-slate-800 px-1 rounded">KEY="value with spaces"</code></li>
                      <li>Variables with sensitive keywords will be marked as secrets automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              {parsedVariables.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No variables to preview</p>
                  <p className="text-slate-500 text-sm">Enter variables in the Input tab to see the preview</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                      {validVariables.length} Valid
                    </Badge>
                    {invalidVariables.length > 0 && (
                      <Badge variant="secondary" className="bg-red-900/20 text-red-400">
                        {invalidVariables.length} Invalid
                      </Badge>
                    )}
                  </div>

                  {/* Variables List */}
                  <div className="max-h-[300px] overflow-y-auto border border-slate-700 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-slate-900 sticky top-0">
                        <tr>
                          <th className="text-left py-2 px-3 text-slate-400 text-sm">Status</th>
                          <th className="text-left py-2 px-3 text-slate-400 text-sm">Key</th>
                          <th className="text-left py-2 px-3 text-slate-400 text-sm">Value</th>
                          <th className="text-left py-2 px-3 text-slate-400 text-sm">Type</th>
                          <th className="text-left py-2 px-3 text-slate-400 text-sm">Line</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedVariables.map((variable, index) => (
                          <tr key={index} className="border-b border-slate-700 hover:bg-slate-750">
                            <td className="py-2 px-3">
                              {variable.valid ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <code className={`text-sm font-mono px-2 py-1 rounded ${
                                variable.valid 
                                  ? "text-emerald-400 bg-slate-900" 
                                  : "text-red-400 bg-red-900/20"
                              }`}>
                                {variable.key || "INVALID"}
                              </code>
                            </td>
                            <td className="py-2 px-3">
                              <code className="text-sm font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded max-w-xs truncate block">
                                {variable.sensitive ? "••••••••" : (variable.value || "MISSING")}
                              </code>
                            </td>
                            <td className="py-2 px-3">
                              <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded w-fit ${
                                variable.sensitive
                                  ? "bg-red-900/20 text-red-400"
                                  : "bg-slate-700 text-slate-300"
                              }`}>
                                {variable.sensitive ? (
                                  <Shield className="w-3 h-3" />
                                ) : (
                                  <Key className="w-3 h-3" />
                                )}
                                <span>{variable.sensitive ? "Secret" : "Variable"}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className="text-sm text-slate-400">{variable.line}</span>
                              {variable.error && (
                                <div className="text-xs text-red-400 mt-1">{variable.error}</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Invalid Variables Warning */}
                  {invalidVariables.length > 0 && (
                    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-200">
                          <p className="font-medium mb-1">
                            {invalidVariables.length} variable{invalidVariables.length > 1 ? 's' : ''} will be skipped:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-red-300">
                            {invalidVariables.slice(0, 3).map((variable, index) => (
                              <li key={index}>
                                Line {variable.line}: {variable.error}
                              </li>
                            ))}
                            {invalidVariables.length > 3 && (
                              <li>... and {invalidVariables.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-white border-slate-600 hover:bg-slate-700"
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={!canImport || isImporting}
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {validVariables.length} Variable{validVariables.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
