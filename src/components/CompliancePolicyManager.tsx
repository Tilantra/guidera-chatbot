import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
}

interface CompliancePolicyManagerProps {
  complianceEnabled?: boolean;
}

export const CompliancePolicyManager = ({ complianceEnabled = true }: CompliancePolicyManagerProps) => {
  const [policies, setPolicies] = useState<CompliancePolicy[]>([
    {
      id: '1',
      name: 'Social Security Number',
      description: 'Detects US Social Security Numbers in XXX-XX-XXXX format'
    },
    {
      id: '2',
      name: 'Email Addresses',
      description: 'Identifies email addresses in content'
    },
    {
      id: '3',
      name: 'Sensitive Keywords',
      description: 'Flags content containing sensitive terms'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<CompliancePolicy>>({
    name: '',
    description: ''
  });

  const handleAddPolicy = () => {
    if (!newPolicy.name || !newPolicy.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const policy: CompliancePolicy = {
      id: Date.now().toString(),
      name: newPolicy.name,
      description: newPolicy.description
    };

    setPolicies(prev => [...prev, policy]);
    setNewPolicy({
      name: '',
      description: ''
    });
    setIsAddDialogOpen(false);
    toast.success("Policy added successfully");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this policy detects"
                  value={newPolicy.description || ''}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
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
        {policies.map((policy) => (
          <Card key={policy.id} className="shadow-card bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">{policy.name}</h3>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4 text-destructive hover:bg-destructive/10"
                  onClick={() => setPolicies(prev => prev.filter(p => p.id !== policy.id))}
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