import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Shield, Trash } from "lucide-react";
import { toast } from "sonner";

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
  const [newPolicy, setNewPolicy] = useState<Partial<CompliancePolicy>>({
    name: '',
    description: '',
    type: '',
  });

  // Fetch policies from backend using client
  const fetchPolicies = async () => {
    try {
      const data = await client.getPolicies();
      console.log('Fetched policies:', data); // DEBUG
      // Map input and output policies to unified array
      const inputPolicies = (data.input_policies || []).map((desc: string, idx: number) => ({
        id: `input-${idx}`,
        name: 'Input Policy',
        description: desc,
        type: 'input',
      }));
      const outputPolicies = (data.output_policies || []).map((desc: string, idx: number) => ({
        id: `output-${idx}`,
        name: 'Output Policy',
        description: desc,
        type: 'output',
      }));
      const allPolicies = [...inputPolicies, ...outputPolicies];
      console.log('Mapped policies:', allPolicies); // DEBUG
      setPolicies(allPolicies);
    } catch (err) {
      setPolicies([]);
    }
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
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header - always at the top */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Compliance Policy Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure and manage compliance policies for content analysis
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Compliance Policy</DialogTitle>
              <DialogDescription>
                Create a new policy for content analysis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Policy Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Phone Numbers"
                  value={newPolicy.name || ''}
                  onChange={e => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                />
                <div className="mb-6"></div>
                <Label htmlFor="type">Type *</Label>
                <div className="relative">
                  <select
                    id="type"
                    value={newPolicy.type || ''}
                    onChange={e => setNewPolicy(prev => ({ ...prev, type: e.target.value }))}
                    className={`w-full border rounded p-2 mb-2 pr-8 appearance-none ${!newPolicy.type ? 'text-gray-400' : ''}`}
                    required
                  >
                    <option value="" hidden>e.g., Input or Output</option>
                    <option value="input">Input</option>
                    <option value="output">Output</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ▼
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this policy detects"
                  value={newPolicy.description || ''}
                  onChange={e => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPolicy}>
                Add Policy
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Policies List */}
      <div className="grid grid-cols-1 gap-4">
        {policies.length === 0 && (
          <div className="text-muted-foreground text-center py-8">No policies found.</div>
        )}
        {policies.map((policy) => (
          <Card key={policy.id} className="shadow-card bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${policy.type === 'input' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeletePolicy(policy)}
                  aria-label="Delete policy"
                >
                  <Trash className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};