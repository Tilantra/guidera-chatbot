import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme } from "./ThemeProvider";
import { Avatar } from "./Avatar";
import { AvatarSelector } from "./AvatarSelector";
import { User, Key, Palette, CreditCard, Bell, Shield, Lock, Plus, Trash2, Eye, EyeOff, Globe, Monitor, Sun, Moon, Settings2, Smartphone, Mail, MessageSquare, AlertTriangle, RotateCcw, BarChart3, Target, TrendingUp } from "lucide-react";

const sidebarItems = [
  { key: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  { key: "api", label: "API Keys", icon: <Key className="h-5 w-5" /> },
  { key: "theme", label: "Themes", icon: <Palette className="h-5 w-5" /> },
  { key: "credits", label: "Credits", icon: <CreditCard className="h-5 w-5" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
  { key: "security", label: "Security", icon: <Shield className="h-5 w-5" /> },
];

export const SettingsPage = () => {
  const { theme, setTheme, displaySettings, updateDisplaySetting, userProfile, updateUserProfile } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Production API", key: "gd_••••••••••••8291", created: "2024-01-15", lastUsed: "2024-01-20" },
    { id: 2, name: "Development API", key: "gd_••••••••••••1847", created: "2024-01-10", lastUsed: "2024-01-19" }
  ]);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    security: true,
    updates: true,
    marketing: false,
    compliance: true,
    system: true
  });
  const [security, setSecurity] = useState({
    twoFA: false,
    emailVerification: true,
    sessionTimeout: "30",
    loginNotifications: true,
    deviceTracking: true,
    apiAccess: true
  });
  const [credits, setCredits] = useState({ available: 120, used: 80, total: 200 });

  // Profile handlers
  const handleProfileSave = () => {
    setEditingProfile(false);
    toast.success("Profile updated successfully");
  };

  const handleAvatarChange = (style: string, seed: string) => {
    updateUserProfile({ avatarStyle: style, avatarSeed: seed });
    toast.success("Avatar updated successfully");
  };

  // API Key handlers
  const handleAddApiKey = () => {
    const newKey = {
      id: Date.now(),
      name: "New API Key",
      key: `gd_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never"
    };
    setApiKeys(prev => [...prev, newKey]);
    toast.success("API Key created successfully");
  };

  const handleDeleteApiKey = (id: number) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
    toast.success("API Key deleted");
  };

  // Theme handlers
  const handleThemeChange = (value: "light" | "dark" | "system" | "light-high-contrast" | "dark-high-contrast" | "soft-dark") => {
    setTheme(value);
    toast.success(`Theme changed to ${value.replace('-', ' ')}`);
  };

  const handleDisplaySettingChange = (setting: string, value: boolean | string) => {
    updateDisplaySetting(setting as any, value as any);
    toast.success("Display setting updated");
  };

  // Credits handlers
  const handleBuyCredits = (amount: number) => {
    setCredits(c => ({ 
      ...c, 
      available: c.available + amount,
      total: c.total + amount
    }));
    toast.success(`${amount} credits purchased successfully`);
  };

  // Notification handlers
  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: value }));
    toast.success("Notification preferences updated");
  };

  // Security handlers
  const handleSecurityChange = (setting: string, value: boolean | string) => {
    setSecurity(prev => ({ ...prev, [setting]: value }));
    toast.success("Security setting updated");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <Card className="p-6 w-full">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</h2>
            {editingProfile ? (
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">
                        <span className="font-medium">Full Name</span>
                        <Input
                          value={userProfile.name}
                          onChange={e => updateUserProfile({ name: e.target.value })}
                          className="mt-1"
                          placeholder="Enter your full name"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block mb-2">
                        <span className="font-medium">Email Address</span>
                        <Input
                          value={userProfile.email}
                          onChange={e => updateUserProfile({ email: e.target.value })}
                          className="mt-1"
                          placeholder="Enter your email"
                          type="email"
                        />
                      </label>
                    </div>
                    <div>
                      <label className="block mb-2">
                        <span className="font-medium">Company</span>
                        <Input
                          value={userProfile.company}
                          onChange={e => updateUserProfile({ company: e.target.value })}
                          className="mt-1"
                          placeholder="Enter your company"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* Avatar Selector */}
                  <div>
                    <AvatarSelector
                      currentStyle={userProfile.avatarStyle}
                      currentSeed={userProfile.avatarSeed}
                      onAvatarChange={handleAvatarChange}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleProfileSave}>Save Changes</Button>
                  <Button variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Avatar Display */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar 
                    style={userProfile.avatarStyle} 
                    seed={userProfile.avatarSeed} 
                    size={64}
                    className="border-2 border-border"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Avatar</p>
                    <p className="font-medium">{userProfile.name}</p>
                    <p className="text-sm text-muted-foreground">{userProfile.role} at {userProfile.company}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{userProfile.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{userProfile.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{userProfile.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => setEditingProfile(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      case "api":
        return (
          <Card className="p-6 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Key className="h-5 w-5" /> API Keys
              </h2>
              <Button onClick={handleAddApiKey} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add New Key
              </Button>
            </div>
            
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{key.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {key.lastUsed === "Never" ? "Never used" : `Last used: ${key.lastUsed}`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {key.key}
                      </code>
                      <span>•</span>
                      <span>Created: {key.created}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {apiKeys.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys created yet</p>
                  <p className="text-sm">Create your first API key to get started</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">API Usage Guidelines</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Keep your API keys secure and never share them publicly</li>
                <li>• Rotate keys regularly for better security</li>
                <li>• Use different keys for different environments</li>
                <li>• Monitor usage to detect any unauthorized access</li>
              </ul>
            </div>
          </Card>
        );
      case "theme":
        return (
          <Card className="p-6 w-full">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5" /> Appearance & Display
            </h2>
            
            {/* Theme Selection */}
            <div className="mb-8">
              <h3 className="font-medium mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeChange("light")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-white border rounded-full flex items-center justify-center">
                      <Sun className="h-3 w-3 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium">Light</span>
                  </div>
                  <div className="w-full h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded border flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded shadow-sm"></div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gray-900 border rounded-full flex items-center justify-center">
                      <Moon className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Dark</span>
                  </div>
                  <div className="w-full h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded border flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-700 rounded shadow-sm"></div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    theme === "soft-dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeChange("soft-dark")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-slate-800 border rounded-full flex items-center justify-center">
                      <Moon className="h-3 w-3 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium">Soft Dark</span>
                  </div>
                  <div className="w-full h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded border flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-600 rounded shadow-sm"></div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeChange("system")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-800 border rounded-full flex items-center justify-center">
                      <Monitor className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">System</span>
                  </div>
                  <div className="w-full h-8 bg-gradient-to-r from-gray-100 to-gray-800 rounded border flex items-center justify-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-700 rounded shadow-sm"></div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    theme === "light-high-contrast" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeChange("light-high-contrast")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-white border-2 border-black rounded-full flex items-center justify-center">
                      <Sun className="h-3 w-3 text-black" />
                    </div>
                    <span className="text-sm font-medium">Light HC</span>
                  </div>
                  <div className="w-full h-8 bg-white rounded border-2 border-black flex items-center justify-center">
                    <div className="w-4 h-4 bg-black rounded"></div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    theme === "dark-high-contrast" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleThemeChange("dark-high-contrast")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-black border-2 border-white rounded-full flex items-center justify-center">
                      <Moon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">Dark HC</span>
                  </div>
                  <div className="w-full h-8 bg-black rounded border-2 border-white flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-6">
              <h3 className="font-medium">Display Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">High Contrast</p>
                        <p className="text-sm text-muted-foreground">Use high contrast themes automatically</p>
                      </div>
                    </div>
                    <Switch 
                      checked={displaySettings.highContrast}
                      onCheckedChange={(value) => handleDisplaySettingChange("highContrast", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Compact Mode</p>
                        <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                      </div>
                    </div>
                    <Switch 
                      checked={displaySettings.compactMode}
                      onCheckedChange={(value) => handleDisplaySettingChange("compactMode", value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Reduced Motion</p>
                        <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                      </div>
                    </div>
                    <Switch 
                      checked={displaySettings.reducedMotion}
                      onCheckedChange={(value) => handleDisplaySettingChange("reducedMotion", value)}
                    />
                  </div>
                  
                  <div className="p-3 rounded-lg border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Font Size</p>
                        <p className="text-sm text-muted-foreground">Adjust text size for readability</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={displaySettings.fontSize === "small" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDisplaySettingChange("fontSize", "small")}
                      >
                        Small
                      </Button>
                      <Button 
                        variant={displaySettings.fontSize === "medium" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDisplaySettingChange("fontSize", "medium")}
                      >
                        Medium
                      </Button>
                      <Button 
                        variant={displaySettings.fontSize === "large" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDisplaySettingChange("fontSize", "large")}
                      >
                        Large
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      case "credits":
        return (
          <div className="space-y-4">
            {/* Credits Overview Dashboard */}
            <Card className="p-4 w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Credits Dashboard
                </h2>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Pro Plan
                </Badge>
              </div>
              
              <div className="mb-6">
                {/* Main Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/40 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{credits.available}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Available</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/40 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{credits.used}</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">Used</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/40 rounded-lg border border-green-200/50 dark:border-green-800/50">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{credits.total}</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Total</div>
                  </div>
                </div>
                
                {/* Usage Summary Card */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                          {((credits.used / credits.total) * 100).toFixed(1)}% Usage
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                          {credits.available} credits remaining this month
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Monthly Limit</div>
                      <div className="text-lg font-semibold">{credits.total}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Compact Progress Bar */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Monthly Usage</span>
                  <span className="text-sm text-muted-foreground">{credits.used}/{credits.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((credits.used / credits.total) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </Card>
            
            {/* Compact Purchase Options */}
            <Card className="p-4 w-full">
              <h3 className="text-lg font-semibold mb-4">Add Credits</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow text-center">
                  <div className="space-y-3">
                    <div className="text-xl font-bold">100</div>
                    <div className="text-lg font-semibold text-primary">$9.99</div>
                    <div className="text-xs text-muted-foreground">$0.10 per credit</div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleBuyCredits(100)}>
                      Purchase
                    </Button>
                  </div>
                </div>
                
                <div className="border-2 border-primary rounded-lg p-4 bg-primary/5 relative text-center">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                    Best Value
                  </Badge>
                  <div className="space-y-3">
                    <div className="text-xl font-bold">500</div>
                    <div>
                      <div className="text-lg font-semibold text-primary">$39.99</div>
                      <div className="text-xs text-green-600 font-medium">Save 20%</div>
                    </div>
                    <div className="text-xs text-muted-foreground">$0.08 per credit</div>
                    <Button size="sm" className="w-full" onClick={() => handleBuyCredits(500)}>
                      Purchase
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow text-center">
                  <div className="space-y-3">
                    <div className="text-xl font-bold">1,000</div>
                    <div>
                      <div className="text-lg font-semibold text-primary">$69.99</div>
                      <div className="text-xs text-green-600 font-medium">Save 30%</div>
                    </div>
                    <div className="text-xs text-muted-foreground">$0.07 per credit</div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleBuyCredits(1000)}>
                      Purchase
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Quick Info */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">💡 Credits never expire</span> • 1 credit = 1 AI check • Secure payment via Stripe
                </div>
              </div>
            </Card>
          </div>
        );
      case "notifications":
        return (
          <Card className="p-6 w-full">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5" /> Notification Preferences
            </h2>
            
            <div className="space-y-8">
              {/* Communication Channels */}
              <div>
                <h3 className="font-medium mb-4">Communication Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(value) => handleNotificationChange("email", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Push</p>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(value) => handleNotificationChange("push", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">SMS</p>
                        <p className="text-sm text-muted-foreground">Text message alerts</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.sms}
                      onCheckedChange={(value) => handleNotificationChange("sms", value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Notification Types */}
              <div>
                <h3 className="font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-muted-foreground">Login attempts, password changes, and security events</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.security}
                      onCheckedChange={(value) => handleNotificationChange("security", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium">Compliance Alerts</p>
                        <p className="text-sm text-muted-foreground">Policy violations and compliance warnings</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.compliance}
                      onCheckedChange={(value) => handleNotificationChange("compliance", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Product Updates</p>
                        <p className="text-sm text-muted-foreground">New features, improvements, and announcements</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.updates}
                      onCheckedChange={(value) => handleNotificationChange("updates", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">System Notifications</p>
                        <p className="text-sm text-muted-foreground">Service status, maintenance, and system updates</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.system}
                      onCheckedChange={(value) => handleNotificationChange("system", value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <p className="font-medium">Marketing</p>
                        <p className="text-sm text-muted-foreground">Promotional content, tips, and special offers</p>
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.marketing}
                      onCheckedChange={(value) => handleNotificationChange("marketing", value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Notification Summary */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Quick Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Active channels: {Object.entries(notifications).slice(0, 3).filter(([_, enabled]) => enabled).length} of 3</p>
                  <p>• Active notification types: {Object.entries(notifications).slice(3).filter(([_, enabled]) => enabled).length} of 5</p>
                  <p>• You can change these preferences at any time</p>
                </div>
              </div>
            </div>
          </Card>
        );
      case "security":
        return (
          <div className="space-y-6">
            {/* Security Overview */}
            <Card className="p-6 w-full">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5" /> Security & Privacy
              </h2>
              
              {/* Security Status */}
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100">Security Status: Good</h3>
                    <p className="text-sm text-green-800 dark:text-green-200">Your account is protected with modern security features</p>
                  </div>
                </div>
              </div>
              
              {/* Authentication Settings */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                          <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">Two-Factor Authentication (2FA)</p>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <Switch 
                        checked={security.twoFA}
                        onCheckedChange={(value) => handleSecurityChange("twoFA", value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-muted-foreground">Verify your email for sensitive actions</p>
                        </div>
                      </div>
                      <Switch 
                        checked={security.emailVerification}
                        onCheckedChange={(value) => handleSecurityChange("emailVerification", value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Session Management */}
                <div>
                  <h3 className="font-medium mb-4">Session Management</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                          <Settings2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium">Session Timeout</p>
                          <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={security.sessionTimeout === "15" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSecurityChange("sessionTimeout", "15")}
                        >
                          15 min
                        </Button>
                        <Button 
                          variant={security.sessionTimeout === "30" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSecurityChange("sessionTimeout", "30")}
                        >
                          30 min
                        </Button>
                        <Button 
                          variant={security.sessionTimeout === "60" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSecurityChange("sessionTimeout", "60")}
                        >
                          1 hour
                        </Button>
                        <Button 
                          variant={security.sessionTimeout === "never" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSecurityChange("sessionTimeout", "never")}
                        >
                          Never
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                          <Bell className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium">Login Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                        </div>
                      </div>
                      <Switch 
                        checked={security.loginNotifications}
                        onCheckedChange={(value) => handleSecurityChange("loginNotifications", value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Privacy & Data */}
                <div>
                  <h3 className="font-medium mb-4">Privacy & Data</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                          <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium">Device Tracking</p>
                          <p className="text-sm text-muted-foreground">Track devices used to access your account</p>
                        </div>
                      </div>
                      <Switch 
                        checked={security.deviceTracking}
                        onCheckedChange={(value) => handleSecurityChange("deviceTracking", value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                          <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">API Access Logging</p>
                          <p className="text-sm text-muted-foreground">Log all API key usage and access attempts</p>
                        </div>
                      </div>
                      <Switch 
                        checked={security.apiAccess}
                        onCheckedChange={(value) => handleSecurityChange("apiAccess", value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Password & Account Actions */}
                <div>
                  <h3 className="font-medium mb-4">Account Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-muted-foreground">Update your account password</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">Security Log</p>
                          <p className="text-sm text-muted-foreground">View recent security events</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 justify-start">
                      <div className="flex items-center gap-3">
                        <Settings2 className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">Active Sessions</p>
                          <p className="text-sm text-muted-foreground">Manage logged-in devices</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 justify-start text-destructive hover:text-destructive">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Security Recommendations */}
            <Card className="p-6 w-full">
              <h3 className="font-medium mb-4">Security Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Enable 2FA</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">Add two-factor authentication for enhanced security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">Strong Password</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">Use a unique, complex password for your account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Bell className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Monitor Activity</p>
                    <p className="text-sm text-green-800 dark:text-green-200">Keep login notifications enabled to spot suspicious activity</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return (
          <Card className="p-6 w-full">
            <h2 className="text-lg font-bold mb-4">{activeTab}</h2>
            <p>Content for {activeTab}</p>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-4 flex flex-col gap-2">
        {sidebarItems.map(item => (
          <Button
            key={item.key}
            variant={activeTab === item.key ? "default" : "ghost"}
            className="flex items-center gap-2 w-full justify-start"
            onClick={() => setActiveTab(item.key)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
