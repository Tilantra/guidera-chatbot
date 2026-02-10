import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus, Shield, Trash, FileText, Lock, Eye, EyeOff, RefreshCw,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "./ThemeProvider";

interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface CompliancePolicyManagerProps {
  complianceEnabled?: boolean;
  client: any;
  isActive?: boolean; // <-- add this
}

export const CompliancePolicyManager = ({ complianceEnabled = true, client, isActive }: CompliancePolicyManagerProps) => {
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<CompliancePolicy>>({
    name: '',
    description: '',
    type: '',
  });
  const { theme } = useTheme();

  // Fetch policies from backend using client
  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await client.getPolicies();
      // Robust description extraction
      const extractDescription = (item: any): string => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.description || item.content || item.text || JSON.stringify(item);
        }
        return '';
      };

      // Map input and output policies to unified array
      const inputPolicies = (data.input_policies || []).map((item: any, idx: number) => ({
        id: `input-${idx}`,
        name: 'Input Policy',
        description: extractDescription(item),
        type: 'input',
      }));
      const outputPolicies = (data.output_policies || []).map((item: any, idx: number) => ({
        id: `output-${idx}`,
        name: 'Output Policy',
        description: extractDescription(item),
        type: 'output',
      }));
      const allPolicies = [...inputPolicies, ...outputPolicies];
      setPolicies(allPolicies);
    } catch (err) {
      setPolicies([]);
      toast.error('Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  };

  // Policy statistics
  const stats = {
    total: policies.length,
    input: policies.filter(p => p.type === 'input').length,
    output: policies.filter(p => p.type === 'output').length,
  };

  useEffect(() => {
    if (isActive) {
      fetchPolicies();
    }
  }, [isActive]);

  const handleAddPolicy = async () => {
    if (!newPolicy.name || !newPolicy.description || !newPolicy.type) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await client.addPolicy(newPolicy.type, newPolicy.description);
      setNewPolicy({ name: '', description: '', type: '' });
      setIsAddDialogOpen(false);
      toast.success("Policy added successfully");
      fetchPolicies();
    } catch (err: any) {
      toast.error(err.message || "Failed to add policy");
    }
  };

  const handleDeletePolicy = async (policy: CompliancePolicy) => {
    try {
      await client.removePolicy(policy.type, policy.description);
      toast.success("Policy removed successfully");
      fetchPolicies();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove policy");
    }
  };

  return (
    <div className="w-full max-w-[95vw] mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Policy Management
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Lock className="h-3 w-3" />
            Configure and manage compliance policies
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button id="add-policy-button" className="gap-2 bg-primary/90 hover:bg-primary">
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gradient-to-br from-card to-secondary/5">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Create New Compliance Policy
                </DialogTitle>
                <DialogDescription>
                  Define a new policy to enhance your content analysis and security framework.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Policy Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Personal Data Detection"
                      value={newPolicy.name || ''}
                      onChange={e => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">Policy Type *</Label>
                    <select
                      id="type"
                      value={newPolicy.type || ''}
                      onChange={e => setNewPolicy(prev => ({ ...prev, type: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select type</option>
                      <option value="input">Input</option>
                      <option value="output">Output</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Policy Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this policy detects, prevents, or validates..."
                    value={newPolicy.description || ''}
                    onChange={e => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPolicy} className="bg-primary hover:bg-primary/90">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Policy
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Policies", value: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Input Controls", value: stats.input, icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Output Filters", value: stats.output, icon: EyeOff, color: "text-green-600", bg: "bg-green-50" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/40 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} dark:bg-muted/10 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>



      {/* Policies Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading policies...</p>
          </div>
        </div>
      ) : policies.length === 0 ? (
        <Card className="border border-dashed border-border/60 bg-secondary/10">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No policies configured
            </h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first compliance policy to enhance security.
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Policy
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${policy.type === 'input'
                      ? 'bg-purple-100 dark:bg-purple-950/30'
                      : 'bg-green-100 dark:bg-green-950/30'
                      }`}>
                      {policy.type === 'input' ? (
                        <Eye className="h-4 w-4 text-purple-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <Badge variant={policy.type === 'input' ? 'secondary' : 'outline'} className="text-xs">
                      {policy.type === 'input' ? 'Input' : 'Output'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePolicy(policy)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {policy.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};