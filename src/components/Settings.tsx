
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Key, Bell, Trash2 } from "lucide-react";
import { TwoFactorModal } from "./TwoFactorModal";

export const Settings = () => {
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleEnableTwoFactor = () => {
    setShowTwoFactorModal(true);
  };

  const handleDisableTwoFactor = () => {
    setTwoFactorEnabled(false);
  };

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
              <Label htmlFor="full-name" className="text-white">Full Name</Label>
              <Input
                id="full-name"
                defaultValue="John Doe"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                defaultValue="john@example.com"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white">Company</Label>
              <Input
                id="company"
                placeholder="Enter your company name"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-400">
                  {twoFactorEnabled ? "2FA is enabled on your account" : "Add an extra layer of security"}
                </p>
              </div>
              {twoFactorEnabled ? (
                <Button 
                  variant="destructive" 
                  onClick={handleDisableTwoFactor}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Disable
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleEnableTwoFactor}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Enable
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Session Timeout</h4>
                <p className="text-sm text-gray-400">
                  Auto-logout inactive users
                </p>
              </div>
              <select className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white">
                <option>24 hours</option>
                <option>1 week</option>
                <option>1 month</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Activity Logging</h4>
                <p className="text-sm text-gray-400">
                  Track all account activities
                </p>
              </div>
              <span className="text-green-400 text-sm font-medium">Enabled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">API Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-white">Personal Access Token</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  value="dp.st.prod.••••••••••••••••••••••••••••••••"
                  readOnly
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  Copy
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="text-white">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-app.com/webhooks/envsync"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
              Regenerate Token
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-electric_indigo-500" />
              <CardTitle className="text-white">Notifications</CardTitle>
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
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric_indigo-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Slack Integration</h4>
                <p className="text-sm text-gray-400">
                  Send alerts to Slack
                </p>
              </div>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                Connect
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Digest Frequency</h4>
                <p className="text-sm text-gray-400">
                  Weekly activity summary
                </p>
              </div>
              <select className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white">
                <option>Weekly</option>
                <option>Daily</option>
                <option>Monthly</option>
                <option>Never</option>
              </select>
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
            <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <TwoFactorModal
        isOpen={showTwoFactorModal}
        onClose={() => {
          setShowTwoFactorModal(false);
          setTwoFactorEnabled(true);
        }}
      />
    </div>
  );
};
