import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Users, Plus, RefreshCw } from "lucide-react";

interface Team {
  id: string;
  name: string;
  description?: string;
  color?: string;
  role?: string;
  members?: number;
}

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  loading?: boolean;
  onSelectTeam: (teamId: string) => void;
  onCreateTeam: () => void;
  onWorkPrivately: () => void;
  onRefresh: () => void;
}

export function TeamManagementDialog({
  open,
  onOpenChange,
  teams,
  loading = false,
  onSelectTeam,
  onCreateTeam,
  onWorkPrivately,
  onRefresh,
}: TeamManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Team
              </DialogTitle>
              <DialogDescription>
                Choose a team context or work privately
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh Teams"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </DialogHeader>

        {/* Work Privately Button */}
        <Button
          variant="outline"
          onClick={() => {
            onWorkPrivately();
            onOpenChange(false);
          }}
          className="w-full justify-start"
        >
          <div className="flex items-center gap-2">
            🔒 <span>Work Privately (Personal)</span>
          </div>
        </Button>

        {/* Teams List */}
        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-2">No teams yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first team to collaborate
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    onSelectTeam(team.id);
                  }}
                  className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: team.color || "#6366f1" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold truncate">{team.name}</h3>
                        {team.role && (
                          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                            {team.role}
                          </span>
                        )}
                      </div>
                      {team.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                          {team.description}
                        </p>
                      )}
                      {team.members !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {team.members} member{team.members !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Create Team Button */}
        <Button onClick={onCreateTeam} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </DialogContent>
    </Dialog>
  );
}
