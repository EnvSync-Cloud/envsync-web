
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Eye, EyeOff, Copy, Edit, Trash2, Search } from "lucide-react";

interface ProjectEnvironmentsProps {
  projectName: string;
  onBack: () => void;
}

export const ProjectEnvironments = ({ projectName, onBack }: ProjectEnvironmentsProps) => {
  const [selectedEnv, setSelectedEnv] = useState("development");
  const [searchQuery, setSearchQuery] = useState("");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const environments = [
    { id: "development", name: "Development", color: "bg-blue-500" },
    { id: "staging", name: "Staging", color: "bg-yellow-500" },
    { id: "production", name: "Production", color: "bg-red-500" },
  ];

  const envVars = {
    development: [
      { key: "DATABASE_URL", value: "postgresql://localhost:5432/app_dev", sensitive: true },
      { key: "API_KEY", value: "pk_test_123", sensitive: true },
      { key: "NODE_ENV", value: "development", sensitive: false },
      { key: "PORT", value: "3000", sensitive: false },
    ],
    staging: [
      { key: "DATABASE_URL", value: "postgresql://staging-db:5432/app", sensitive: true },
      { key: "API_KEY", value: "pk_staging_456", sensitive: true },
      { key: "NODE_ENV", value: "staging", sensitive: false },
      { key: "PORT", value: "3000", sensitive: false },
    ],
    production: [
      { key: "DATABASE_URL", value: "postgresql://prod-db:5432/app", sensitive: true },
      { key: "API_KEY", value: "pk_live_789", sensitive: true },
      { key: "NODE_ENV", value: "production", sensitive: false },
      { key: "PORT", value: "8080", sensitive: false },
    ],
  };

  const currentEnvVars = envVars[selectedEnv as keyof typeof envVars] || [];
  const filteredVars = currentEnvVars.filter(envVar =>
    envVar.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleValueVisibility = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value: string) => "•".repeat(Math.min(value.length, 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{projectName}</h1>
            <p className="text-gray-400 mt-2">Manage environment variables</p>
          </div>
        </div>
        <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Secret
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          {environments.map((env) => (
            <Button
              key={env.id}
              variant={selectedEnv === env.id ? "default" : "outline"}
              onClick={() => setSelectedEnv(env.id)}
              className={
                selectedEnv === env.id
                  ? "bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
                  : "border-gray-600 text-white hover:bg-gray-700"
              }
            >
              <div className={`w-2 h-2 rounded-full ${env.color} mr-2`} />
              {env.name}
            </Button>
          ))}
        </div>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search secrets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 focus:border-electric_indigo-500 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {environments.find(env => env.id === selectedEnv)?.name} Environment
            </CardTitle>
            <Badge variant="secondary" className="bg-gray-700 text-white">
              {filteredVars.length} secrets
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVars.map((envVar) => (
              <div key={envVar.key} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-mono font-medium text-electric_indigo-400">
                      {envVar.key}
                    </span>
                    {envVar.sensitive && (
                      <Badge variant="destructive" className="text-xs">
                        Sensitive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={showValues[envVar.key] ? envVar.value : maskValue(envVar.value)}
                      readOnly
                      className="bg-gray-800 border-gray-700 font-mono text-sm text-white"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleValueVisibility(envVar.key)}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      {showValues[envVar.key] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-gray-700">
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
