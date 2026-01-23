import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { SearchResult } from "@/lib/capsule-types";

interface SaveCapsuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SaveCapsuleData) => Promise<void>;
  messageCount: number;
  userCapsules: SearchResult[];
  teams?: string[];
  teamIdMap?: Record<string, string>; // Map team name -> team ID
  isLoading?: boolean;
}

export interface SaveCapsuleData {
  mode: "new" | "version";
  tag?: string;
  team?: string; // This will be team name for new, ignored for version
  capsuleId?: string;
}

export function SaveCapsuleDialog({
  open,
  onOpenChange,
  onSave,
  messageCount,
  userCapsules,
  teams = [],
  teamIdMap = {},
  isLoading = false,
}: SaveCapsuleDialogProps) {
  const [mode, setMode] = useState<"new" | "version">("new");
  const [tag, setTag] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("__personal__"); // Use placeholder
  const [selectedCapsule, setSelectedCapsule] = useState<string>("");

  // Create reverse mapping: team ID -> team name for display
  const teamNameMap: Record<string, string> = {};
  Object.entries(teamIdMap).forEach(([name, id]) => {
    teamNameMap[id] = name;
  });

  useEffect(() => {
    if (!open) {
      setMode("new");
      setTag("");
      setSelectedTeam("__personal__");
      setSelectedCapsule("");
    }
  }, [open]);

  const handleSave = async () => {
    try {
      // Convert placeholder to empty string for backend
      const teamValue = selectedTeam === "__personal__" ? "" : selectedTeam;
      
      await onSave({
        mode,
        tag: mode === "new" ? tag : undefined,
        team: mode === "new" ? teamValue : undefined,
        capsuleId: mode === "version" ? selectedCapsule : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save capsule:", error);
    }
  };

  const canSave =
    mode === "new" ? tag.trim().length > 0 : selectedCapsule.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💊 Generate Capsule
          </DialogTitle>
          <DialogDescription>
            Save {messageCount} message{messageCount !== 1 ? "s" : ""} as a capsule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "new" | "version")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="font-normal cursor-pointer">
                Create New Capsule
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="version"
                id="version"
                disabled={userCapsules.length === 0}
              />
              <Label
                htmlFor="version"
                className={`font-normal cursor-pointer ${
                  userCapsules.length === 0 ? "text-muted-foreground" : ""
                }`}
              >
                Add Version to Existing Capsule
                {userCapsules.length === 0 && " (no capsules yet)"}
              </Label>
            </div>
          </RadioGroup>

          {mode === "new" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="tag">Tag / Name *</Label>
                <Input
                  id="tag"
                  placeholder="e.g., project-discussion, bug-fix-context"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Give this capsule a memorable name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={isLoading}>
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Select team (or leave empty for personal)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__personal__">🔒 Work Privately (Personal)</SelectItem>
                    {teams.map((teamName) => (
                      <SelectItem key={teamName} value={teamName}>
                        👥 {teamName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="capsule">Select Capsule *</Label>
              <Select value={selectedCapsule} onValueChange={setSelectedCapsule} disabled={isLoading}>
                <SelectTrigger id="capsule">
                  <SelectValue placeholder="Choose a capsule to add version to" />
                </SelectTrigger>
                <SelectContent>
                  {userCapsules.map((capsule) => {
                    const teamDisplay = capsule.team 
                      ? (teamNameMap[capsule.team] || capsule.team)
                      : "Personal";
                    
                    return (
                      <SelectItem key={capsule.capsule_id} value={capsule.capsule_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{capsule.tag || "Untitled"}</span>
                          <span className="text-xs text-muted-foreground">
                            v{capsule.version_count} • {teamDisplay}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedCapsule && `This will create version ${(userCapsules.find((c) => c.capsule_id === selectedCapsule)?.version_count || 0) + 1}`}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "new" ? "Generate" : "Add Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
