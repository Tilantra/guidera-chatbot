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
import { Loader2 } from "lucide-react";

const TEAM_COLORS = [
  "#6366f1", // Indigo
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#84cc16", // Lime
  "#d946ef", // Fuchsia
  "#06b6d4", // Cyan
  "#78350f", // Brown
  "#4b5563", // Gray
  "#000000", // Black
  "#ffffff", // White
];

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTeam: (name: string, description: string, color: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  onCreateTeam,
  isLoading = false,
}: CreateTeamDialogProps) {
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0]);

  useEffect(() => {
    if (!open) {
      setTeamName("");
      setDescription("");
      setSelectedColor(TEAM_COLORS[0]);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    
    try {
      await onCreateTeam(teamName.trim(), description.trim(), selectedColor);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Set up a new collaborative workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              placeholder="e.g., Engineering, Marketing"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-description">Description (Optional)</Label>
            <Input
              id="team-description"
              placeholder="Brief description of the team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Team Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {TEAM_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  disabled={isLoading}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? "border-primary scale-110 shadow-md" 
                      : "border-transparent hover:scale-105"
                  } ${color === "#ffffff" ? "border-gray-300" : ""}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!teamName.trim() || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
