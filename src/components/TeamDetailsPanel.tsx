import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Loader2, Trash2, UserPlus, UserMinus } from "lucide-react";

interface TeamMember {
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
}

interface TeamDetailsData {
  id: string;
  name: string;
  description?: string;
  color?: string;
  members: TeamMember[];
  userRole?: string; // 'admin' | 'member'
}

interface TeamDetailsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: TeamDetailsData | null;
  loading?: boolean;
  onAddMember: (email: string) => Promise<void>;
  onRemoveMember: (email: string) => Promise<void>;
  onDeleteTeam: () => Promise<void>;
  onBack: () => void;
}

export function TeamDetailsPanel({
  open,
  onOpenChange,
  team,
  loading = false,
  onAddMember,
  onRemoveMember,
  onDeleteTeam,
  onBack,
}: TeamDetailsPanelProps) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAdmin = team?.userRole === "admin";

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    setAddingMember(true);
    try {
      await onAddMember(newMemberEmail.trim());
      setNewMemberEmail("");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (email: string) => {
    setRemovingMember(email);
    try {
      await onRemoveMember(email);
    } finally {
      setRemovingMember(null);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await onDeleteTeam();
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  if (!team) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive hover:text-destructive"
                  title="Delete Team"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div
                className="w-6 h-6 rounded-full shrink-0"
                style={{ backgroundColor: team.color || "#6366f1" }}
              />
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl">{team.name}</DialogTitle>
                {team.description && (
                  <DialogDescription className="mt-1">
                    {team.description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 space-y-4">
            {/* Members Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Members ({team.members.length})</h4>
              </div>

              <ScrollArea className="h-[280px] pr-4">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : team.members.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-center">
                    <p className="text-muted-foreground">No members yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {member.full_name || member.username || member.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {member.role && (
                            <Badge variant="secondary">{member.role}</Badge>
                          )}
                          {isAdmin && member.role !== "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.email)}
                              disabled={removingMember === member.email}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              {removingMember === member.email ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Add Member Section (Admin Only) */}
            {isAdmin && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold text-sm">Add Member</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Member email address"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    disabled={addingMember}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddMember();
                    }}
                  />
                  <Button
                    onClick={handleAddMember}
                    disabled={!newMemberEmail.trim() || addingMember}
                  >
                    {addingMember ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{team.name}"? This action cannot be undone.
              All team capsules will become personal capsules.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
