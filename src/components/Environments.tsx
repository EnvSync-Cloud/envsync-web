
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Eye, EyeOff, Copy, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Environments = () => {
  const [selectedApp, setSelectedApp] = useState("Frontend App");
  const [selectedEnvType, setSelectedEnvType] = useState("Production");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const apps = ["Frontend App", "Backend API", "Data Pipeline"];
  const envTypes = ["Production", "Staging", "Development", "Testing"];
  
  const envVars = [
    { key: "DATABASE_URL", value: "postgresql://prod-db:5432/app", sensitive: true },
    { key: "API_KEY", value: "pk_live_51234567890abcdef", sensitive: true },
    { key: "NODE_ENV", value: "production", sensitive: false },
    { key: "PORT", value: "3000", sensitive: false },
    { key: "REDIS_URL", value: "redis://prod-redis:6379", sensitive: true },
  ];

  const toggleValueVisibility = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value: string) => "•".repeat(Math.min(value.length, 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Environment Variables</h1>
          <p className="text-gray-400 mt-2">
            Manage environment variables across different applications and environments
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Variable
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-400">Application</label>
          <select 
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            {apps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-400">Environment</label>
          <select 
            value={selectedEnvType}
            onChange={(e) => setSelectedEnvType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            {envTypes.map(env => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedApp} - {selectedEnvType}
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-700">
              {envVars.length} variables
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envVars.map((envVar, index) => (
              <div 
                key={envVar.key} 
                className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-medium text-purple-300">
                      {envVar.key}
                    </span>
                    {envVar.sensitive && (
                      <Badge variant="destructive" className="text-xs">
                        Sensitive
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <Input
                      value={showValues[envVar.key] ? envVar.value : maskValue(envVar.value)}
                      readOnly
                      className="bg-gray-800 border-gray-600 font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleValueVisibility(envVar.key)}
                  >
                    {showValues[envVar.key] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
