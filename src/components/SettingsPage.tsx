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
import { User, Key, Palette, Bell, Shield, Lock, Plus, Trash2, Globe, Mail, MessageSquare, Settings2, CreditCard, Sun, Moon, Monitor, Target, RotateCcw, BarChart3, TrendingUp, Info, AlertTriangle } from "lucide-react";

const sidebarItems = [
  { key: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },

  { key: "theme", label: "Themes", icon: <Palette className="h-5 w-5" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
  { key: "security", label: "Security", icon: <Shield className="h-5 w-5" /> },
];

export const SettingsPage = () => {
  const { theme, setTheme, displaySettings, updateDisplaySetting, userProfile, updateUserProfile } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [editingProfile, setEditingProfile] = useState(false);

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
                    <p className="text-sm text-muted-foreground">{userProfile.company}</p>
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

      case "theme":
        return (
          <Card className="p-6 w-full border-border/40 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" /> Appearance & Display
            </h2>

            {/* Theme Selection */}
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {[
                  { id: "light", label: "Light Mode", icon: Sun, color: "text-orange-500", bg: "bg-white" },
                  { id: "dark", label: "Dark Mode", icon: Moon, color: "text-blue-400", bg: "bg-slate-950" },
                  { id: "system", label: "System", icon: Monitor, color: "text-slate-500", bg: "bg-slate-100" },
                  { id: "soft-dark", label: "Soft Dark", icon: Moon, color: "text-indigo-400", bg: "bg-slate-900" }
                ].map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${theme === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
                      }`}
                    onClick={() => handleThemeChange(t.id as any)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${t.bg} border shadow-sm`}>
                        <t.icon className={`h-4 w-4 ${t.color}`} />
                      </div>
                      <span className="text-xs font-bold tracking-tight">{t.label}</span>
                    </div>
                    <div className={`w-full h-12 ${t.bg} rounded-lg border border-border/50 flex flex-col gap-1 p-2`}>
                      <div className="w-2/3 h-1.5 bg-muted rounded-full"></div>
                      <div className="w-full h-1.5 bg-muted/60 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Display Consistency</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { id: "highContrast", label: "High Contrast", desc: "Enhanced readability standards", icon: Shield },
                    { id: "compactMode", label: "Compact Mode", desc: "Optimized density for efficiency", icon: Target }
                  ].map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <opt.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight">{opt.label}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{opt.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={(displaySettings as any)[opt.id]}
                        onCheckedChange={(value) => handleDisplaySettingChange(opt.id, value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-secondary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <RotateCcw className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">Reduced Motion</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Minimize interface animations</p>
                      </div>
                    </div>
                    <Switch
                      checked={displaySettings.reducedMotion}
                      onCheckedChange={(value) => handleDisplaySettingChange("reducedMotion", value)}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-border/40 bg-secondary/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight">Font Scaling</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Adjust visual hierarchy sizes</p>
                      </div>
                    </div>
                    <div className="flex gap-2 p-1 bg-background/50 border rounded-lg">
                      {["small", "medium", "large"].map((size) => (
                        <Button
                          key={size}
                          variant={displaySettings.fontSize === size ? "default" : "ghost"}
                          size="sm"
                          className="flex-1 h-8 text-xs font-bold"
                          onClick={() => handleDisplaySettingChange("fontSize", size)}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      case "credits":
        return (
          <div className="space-y-6">
            <Card className="p-6 w-full border-border/40 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Enterprise Credits
                  </h2>
                  <p className="text-xs text-muted-foreground">Manage your organization's resource allocation</p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 font-bold text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-none">
                  Professional Plan
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: "Available", value: credits.available, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Consumed", value: credits.used, icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "Monthly Quota", value: credits.total, icon: Target, color: "text-green-600", bg: "bg-green-50" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-secondary/20 border border-border/40 flex flex-col items-center text-center group hover:bg-secondary/40 transition-colors">
                    <div className={`h-12 w-12 rounded-xl ${stat.bg} dark:bg-muted/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold tabular-nums tracking-tighter">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-bold">Usage Progress</span>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{((credits.used / credits.total) * 100).toFixed(1)}% of limit reached</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{credits.used} / {credits.total}</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-1000 shadow-lg shadow-primary/20"
                    style={{ width: `${Math.min((credits.used / credits.total) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </Card>

            <Card className="p-6 w-full border-border/40 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Provision Additional Resources</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { amount: 100, price: "$9.99", unit: "$0.10/unit", tier: "Basic" },
                  { amount: 500, price: "$39.99", unit: "$0.08/unit", tier: "Popular", featured: true, save: "20%" },
                  { amount: 1000, price: "$69.99", unit: "$0.07/unit", tier: "Enterprise", save: "30%" }
                ].map((pkg) => (
                  <div
                    key={pkg.amount}
                    className={`relative p-6 rounded-2xl border transition-all hover:shadow-md ${pkg.featured ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-secondary/10 hover:border-primary/40"
                      }`}
                  >
                    {pkg.save && (
                      <Badge className="absolute -top-2 left-6 bg-success text-success-foreground border-none font-bold text-[9px] uppercase px-2">
                        Save {pkg.save}
                      </Badge>
                    )}
                    <div className="space-y-4 text-center">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{pkg.tier}</p>
                        <p className="text-3xl font-bold tracking-tighter">{pkg.amount}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">CREDITS</p>
                      </div>
                      <div className="py-2">
                        <p className="text-2xl font-bold tracking-tight text-primary">{pkg.price}</p>
                        <p className="text-[10px] font-medium text-muted-foreground">{pkg.unit}</p>
                      </div>
                      <Button size="sm" variant={pkg.featured ? "default" : "outline"} className="w-full font-bold h-10 shadow-sm" onClick={() => handleBuyCredits(pkg.amount)}>
                        Provision
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  <span className="font-bold">Enterprise Policy:</span> Credits are valid for the duration of your current contract cycle. Resource allocation is processed via secure Stripe gateway.
                </p>
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
